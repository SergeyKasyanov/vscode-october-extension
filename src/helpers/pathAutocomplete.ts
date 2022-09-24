import * as fs from 'fs';
import path = require('path');
import * as vscode from 'vscode';

export function getPathCompletions(root: string, pathPart: string, exts: string[], prefix: string = '') {

    const dirName = root + (pathPart.replace('/', path.sep));

    if (!fs.existsSync(dirName)) {
        return;
    }

    let result = fs.readdirSync(dirName, { withFileTypes: true })
        .map(entry => {
            if (entry.isDirectory()) {
                return {
                    dir: true,
                    name: entry.name
                };
            }

            for (const ext of exts) {
                if (entry.name.endsWith(ext)) {
                    return {
                        dir: false,
                        name: entry.name
                    };
                }
            }
        })
        .filter(entry => !!entry)
        .map(entry =>
            entry!.dir
                ? new vscode.CompletionItem(prefix + pathPart + entry!.name, vscode.CompletionItemKind.Folder)
                : new vscode.CompletionItem(prefix + pathPart + entry!.name, vscode.CompletionItemKind.File)
        );

    return result;
}
