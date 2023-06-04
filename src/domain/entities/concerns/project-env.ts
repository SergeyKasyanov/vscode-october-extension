import * as vscode from 'vscode';
import { FsHelpers } from "../../helpers/fs-helpers";
import { PathHelpers } from '../../helpers/path-helpers';
import { Project } from "../project";
import { EnvVariable } from '../types';
import path = require("path");

/**
 * Find env key usage locations
 */
export async function findEnvUsages(
    project: Project,
    envVar: EnvVariable,
    includeSelf: boolean = false
): Promise<vscode.Location[]> {
    const directoriesForSearch: string[] = [
        PathHelpers.rootPath(project.path, 'config')
    ];

    if (project.appDir) {
        directoriesForSearch.push(project.appDir.path);
    }

    directoriesForSearch.push(
        ...project.modules.map(m => m.path),
        ...project.plugins.map(p => p.path),
        ...project.themes.map(t => t.path),
    );

    const envCallRegex = new RegExp(`env\\s*\\(\\s*[\\'\\"]${envVar.key}[\\'\\"]`, 'g');
    const quotedKeyRegex = new RegExp(`[\\'\\"]${envVar.key}[\\'\\"]`);

    const locations = [];
    const processedFiles: string[] = [];
    for (const dir of directoriesForSearch) {
        const files = FsHelpers.listFiles(dir, true, ['php', 'htm']);
        for (const file of files) {
            const filePath = path.join(dir, file);

            if (processedFiles.includes(filePath)) {
                continue;
            }

            const fileContent = FsHelpers.readFile(filePath);

            const callMatches = [...fileContent.matchAll(envCallRegex)];
            if (callMatches.length === 0) {
                continue;
            }

            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);

            for (const match of callMatches) {
                const qKeyMatch = match[0]!.match(quotedKeyRegex)!;

                const start = document.positionAt(match.index! + qKeyMatch.index! + 1);
                const end = start.translate(0, envVar.key.length);
                const range = new vscode.Range(start, end);

                locations.push(new vscode.Location(uri, range));
            }

            processedFiles.push(filePath);
        }
    }

    if (includeSelf) {
        locations.push(envVar.location);
    }

    return locations;
}
