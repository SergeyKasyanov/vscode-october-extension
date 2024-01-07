import * as vscode from 'vscode';
import { FsHelpers } from "../helpers/fs-helpers";
import { PathHelpers } from "../helpers/path-helpers";
import { Project } from "../entities/project";
import { Event } from "../entities/types";
import path = require("path");

/**
 * Find usages of event in project
 */
export async function findEventUsages(
    project: Project,
    event: Event,
    includeSelf: boolean = false
) {

    const directoriesForSearch: string[] = [
        PathHelpers.modulesPath(project.path),
        PathHelpers.pluginsPath(project.path),
    ];

    if (project.appDir) {
        directoriesForSearch.push(project.appDir.path);
    }

    const listenEventRegex = new RegExp(`listen\\s*\\(\\[{0,1}[\\'\\"]${event.name}[\\'\\"]`, 'g');
    const quotedEventRegex = new RegExp(`[\\'\\"]${event.name}[\\'\\"]`);

    const locations = [];
    for (const dir of directoriesForSearch) {
        const files = FsHelpers.listFiles(dir, true, ['php']);
        for (const file of files) {
            const filePath = path.join(dir, file);

            const fileContent = FsHelpers.readFile(filePath);

            const callMatches = [...fileContent.matchAll(listenEventRegex)];
            if (callMatches.length === 0) {
                continue;
            }

            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);

            for (const match of callMatches) {
                const qEventMatch = match[0]!.match(quotedEventRegex)!;

                const start = document.positionAt(match.index! + qEventMatch.index! + 1);

                const lineText = document.lineAt(start.line).text.trim();
                if (lineText.startsWith('//') || lineText.startsWith('*')) {
                    continue;
                }

                const end = start.translate(0, event.name.length);
                const range = new vscode.Range(start, end);

                locations.push(new vscode.Location(uri, range));
            }
        }
    }

    if (includeSelf) {
        const uri = vscode.Uri.file(event.filePath);
        const document = await vscode.workspace.openTextDocument(uri);
        const start = document.positionAt(event.offset);
        const end = start.translate(0, event.name.length);
        const range = new vscode.Range(start, end);

        locations.push(new vscode.Location(uri, range));
    }

    return locations;
}
