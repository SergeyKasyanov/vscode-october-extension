import * as fs from 'fs';
import path = require('path');
import * as vscode from 'vscode';
import { pluginsPath } from '../../helpers/paths';
import { regExps } from '../../helpers/regExps';

export class GoToClass {
    public async execute() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }

        const filepath = activeEditor.document.fileName;
        if (!filepath.startsWith(pluginsPath())) {
            this.sayIsNotOpened();
            return;
        }

        let fileDirectoryParts = filepath.replace(pluginsPath(), '').split(path.sep);
        if (fileDirectoryParts[0] === '') {
            fileDirectoryParts.shift();
        }
        const pluginPath = pluginsPath(fileDirectoryParts[0] + path.sep + fileDirectoryParts[1]);

        const classRelatedFileMatch = filepath.match(regExps.classRelatedFile);
        let className, classesDirectory;

        if (classRelatedFileMatch) {
            const splitted = classRelatedFileMatch[0].split(path.sep);
            className = splitted[1];
            classesDirectory = pluginPath + path.sep + splitted[0];
        } else {
            this.sayIsNotOpened();
            return;
        }

        const directoryFiles = fs
            .readdirSync(classesDirectory, { withFileTypes: true })
            .filter(entry => entry.isFile() && entry.name.endsWith('.php'))
            .map(file => file.name);

        let fileToOpen;
        for (const file of directoryFiles) {
            if (file.toLowerCase() === className + '.php') {
                fileToOpen = classesDirectory + path.sep + file;
                break;
            }
        }

        if (!fileToOpen) {
            vscode.window.showInformationMessage('Associated class not found.');
            return;
        }

        vscode.window.showTextDocument(vscode.Uri.file(fileToOpen));
    }

    private sayIsNotOpened() {
        vscode.window.showInformationMessage('Only for config, view or partial of model, controller, component or *widget.');
    }
}
