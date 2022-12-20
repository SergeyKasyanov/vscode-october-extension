import * as fs from 'fs';
import * as vscode from 'vscode';
import { FsHelpers } from '../../domain/helpers/fs-helpers';
import path = require('path');

/**
 * Get completions for files and directories related to root
 *
 * @param root
 * @param pathPart
 * @param exts
 * @param prefix
 * @returns
 */
export function getPathCompletions(
    root: string,
    pathPart: string,
    exts: string[],
    prefix: string = ''
) {
    const dirName = root + (pathPart.replace('/', path.sep));

    if (!FsHelpers.exists(dirName)) {
        return;
    }

    return fs.readdirSync(dirName, { withFileTypes: true })
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
}
