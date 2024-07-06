import * as vscode from 'vscode';
import { Config } from '../../../../config';
import path = require('path');
import prettier = require('prettier');

const watchers: { [path: string]: vscode.FileSystemWatcher } = {};

/**
 * Listen to prettier rc config file changes
 */
export function listenToPrettierConfigChange() {
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('octoberCode')) {
            prettier.clearConfigCache();
        }
    });

    const configPath = Config.prettierrcPath;

    for (const ws of vscode.workspace.workspaceFolders || []) {
        const wsConfigPath = path.join(ws.uri.path, configPath);
        const watcher = vscode.workspace.createFileSystemWatcher(wsConfigPath);

        watcher.onDidCreate(() => prettier.clearConfigCache());
        watcher.onDidChange(() => prettier.clearConfigCache());
        watcher.onDidDelete(() => prettier.clearConfigCache());

        watchers[wsConfigPath] = watcher;
    }
}

/**
 * Dispose and delete filesystem watchers for prettier configs
 */
export function disposeWatchers() {
    for (const wsPath in watchers) {
        if (Object.prototype.hasOwnProperty.call(watchers, wsPath)) {
            const watcher = watchers[wsPath];

            watcher.dispose();

            delete watchers[wsPath];
        }
    }
}
