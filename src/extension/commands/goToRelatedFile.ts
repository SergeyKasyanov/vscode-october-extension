import * as fs from 'fs';
import * as vscode from 'vscode';
import { pluginsPath } from '../../helpers/paths';
import { readDirectoryRecursively } from '../../helpers/readDirectoryRecursively';
import { regExps } from '../../helpers/regExps';
import path = require('path');
import pluralize = require('pluralize');

export class GoToRelatedFile {
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

        // 4 is for october/demo/controllers/Posts.php
        const isClass = fileDirectoryParts.length === 4;

        let classFileName, className, dirName;

        if (isClass) {
            const pluginClass = filepath.match(regExps.pluginClass);
            if (!pluginClass) {
                this.sayIsNotOpened();
                return;
            }

            classFileName = fileDirectoryParts[3];
            className = classFileName.slice(0, -4);
            dirName = filepath.slice(0, -1 * (4 + className.length)) + className.toLowerCase();
        } else {
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

            for (const file of directoryFiles) {
                if (file.toLowerCase() === className + '.php') {
                    classFileName = file;
                    className = classFileName.slice(0, -4);
                    break;
                }
            }

            dirName = classesDirectory + path.sep + className.toLowerCase();
        }

        if (!fs.existsSync(dirName)) {
            vscode.window.showInformationMessage('There is no view/config directory for ' + className);
            return;
        }

        const relatedFiles = readDirectoryRecursively({ dir: dirName, exts: ['.yaml', '.htm', '.php'] });
        if (!relatedFiles) {
            vscode.window.showInformationMessage('Related files not found');
            return;
        }

        const type = pluralize.singular(fileDirectoryParts[2]);

        const fileToOpen = await vscode.window.showQuickPick(relatedFiles, {
            title: 'Choose file related to ' + type + ' '+ className
        });

        if (!fileToOpen) {
            return;
        }

        vscode.window.showTextDocument(vscode.Uri.file(dirName + path.sep + fileToOpen));
    }

    private sayIsNotOpened() {
        vscode.window.showInformationMessage('Only for model, controller, component or *widget class.');
    }
}
