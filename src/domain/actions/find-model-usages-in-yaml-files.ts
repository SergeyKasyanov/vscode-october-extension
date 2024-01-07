import * as vscode from 'vscode';
import { PathHelpers } from "../helpers/path-helpers";
import { Model } from "../entities/classes/model";
import { FsHelpers } from '../helpers/fs-helpers';
import path = require('path');

/**
 * Find all model usages in yaml config files
 */
export async function findModelUsagesInYamlFiles(model: Model): Promise<vscode.Location[]> {
    const project = model.owner.project;

    const escaped = model.fqn.split('\\').join('\\\\');
    const fqnRegex = new RegExp(`${escaped}(\\s+|$)`, 'g');

    const locations = [];
    const processedFiles: string[] = [];
    for (const dir of project.backendOwnersPaths) {
        const files = FsHelpers.listFiles(dir, true, ['yaml']);
        for (const file of files) {
            const filePath = path.join(dir, file);

            if (processedFiles.includes(filePath)) {
                continue;
            }

            const fileContent = FsHelpers.readFile(filePath);

            const fqnMatches = [...fileContent.matchAll(fqnRegex)];
            if (fqnMatches.length === 0) {
                continue;
            }

            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);

            for (const match of fqnMatches) {
                const start = document.positionAt(match.index!);
                const end = start.translate(0, model.fqn.length);
                const range = new vscode.Range(start, end);

                locations.push(new vscode.Location(uri, range));
            }

            processedFiles.push(filePath);
        }
    }

    return locations;
}
