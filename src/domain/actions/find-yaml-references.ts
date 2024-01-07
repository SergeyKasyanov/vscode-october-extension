import * as vscode from 'vscode';
import { FsHelpers } from '../helpers/fs-helpers';
import { PathHelpers } from '../helpers/path-helpers';
import { Store } from '../services/store';
import { Behavior } from '../entities/classes/behavior';
import { Controller } from '../entities/classes/controller';
import { Widget } from '../entities/classes/widget';
import { BackendOwner } from '../entities/owners/backend-owner';
import { Project } from '../entities/project';
import path = require('path');

/**
 * Find yaml config references in another yaml configs
 */
export async function findYamlReferences(
    project: Project,
    filePath: string
): Promise<vscode.Location[]> {
    return [
        ...await findByGlobalPaths(project, filePath),
        ...await findByLocalPath(filePath)
    ];
}

async function findByGlobalPaths(
    project: Project,
    filePath: string
): Promise<vscode.Location[]> {
    const pathVariants = PathHelpers.pathVariants(project.path, filePath);
    if (pathVariants.length === 0) {
        return [];
    }

    const locations: vscode.Location[] = [];
    for (const dir of project.backendOwnersPaths) {
        for (const variant of pathVariants) {

            const escaped = variant
                .split('$').join('\\$')
                .split('~').join('\\~')
                .split('/').join('\\/')
                .split('.').join('\\.')
                ;

            const variantRegex = new RegExp(escaped, 'g');

            const files = FsHelpers.listFiles(dir, true, ['yaml', 'php', 'htm']);
            for (const file of files) {
                const filePath = path.join(dir, file);

                locations.push(...await findReferencesInFile(
                    filePath,
                    variantRegex,
                    variant
                ));
            }
        }
    }

    return locations;
}

async function findByLocalPath(
    filePath: string
): Promise<vscode.Location[]> {
    const owner = Store.instance.findOwner(filePath) as BackendOwner;
    if (!(owner instanceof BackendOwner)) {
        return [];
    }

    const entity = owner.findEntityByRelatedName(filePath) as Controller | Widget | Behavior;
    if (!(entity instanceof Controller || entity instanceof Widget || entity instanceof Behavior)) {
        return [];
    }

    filePath = filePath.replace(entity.filesDirectory, '').slice(1);

    const searchString = filePath.split('\\').join(path.sep);

    const escaped = searchString
        .split('$').join('\\$')
        .split('~').join('\\~')
        .split('/').join('\\/')
        .split('.').join('\\.')
        ;
    const regex = new RegExp(escaped, 'g');

    const locations: vscode.Location[] = [];

    const entityDir = entity.filesDirectory;
    const files = FsHelpers.listFiles(entityDir, true, ['php', 'yaml', 'htm']);
    for (const file of files) {
        const filePath = path.join(entityDir, file);

        locations.push(...await findReferencesInFile(filePath, regex, searchString));
    }

    locations.push(...await findReferencesInFile(entity.path, regex, searchString));

    return locations;
}

async function findReferencesInFile(
    filePath: string,
    regex: RegExp,
    searchString: string
): Promise<vscode.Location[]> {
    const locations = [];

    const fileContent = FsHelpers.readFile(filePath);

    const matches = [...fileContent.matchAll(regex)];
    if (matches.length === 0) {
        return [];
    }

    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);

    for (const match of matches) {
        const start = document.positionAt(match.index!);
        const end = start.translate(0, searchString.length);
        const range = new vscode.Range(start, end);

        locations.push(new vscode.Location(uri, range));
    }

    return locations;
}
