import * as fs from 'fs';
import * as vscode from 'vscode';
import { phpSelector } from '../../../helpers/fileSelectors';
import { getClassMethodsFromDocument, getControllerPageMethodsFromDocument } from '../../../helpers/parsePhp';
import { pluginsPath } from '../../../helpers/paths';
import { PluginFileUtils } from '../../../helpers/pluginFileUtils';
import path = require('path');

const COMMAND_OPEN_CONTROLLER_VIEW = 'command.openControllerView';

export function registerControllerViewLensProvider(context: vscode.ExtensionContext) {
    vscode.languages.registerCodeLensProvider(phpSelector, new ControllerViewLensProvider());

    vscode.commands.registerCommand(COMMAND_OPEN_CONTROLLER_VIEW, openView);
}

class ControllerViewLensProvider implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (parsed?.directory !== 'controllers') {
            return;
        }

        let codeLenses: vscode.CodeLens[] = [];

        const methods = getControllerPageMethodsFromDocument(document.getText(), document.fileName);
        if (!methods) {
            return;
        }

        for (const methodName in methods) {
            if (Object.prototype.hasOwnProperty.call(methods, methodName)) {
                const method = methods[methodName];

                const viewPath = pluginsPath(path.join(
                    parsed.vendor!, parsed.plugin!, parsed.directory!, parsed.classNameWithoutExt!.toLocaleLowerCase(), methodName
                ));

                if (fs.existsSync(viewPath + '.php') || fs.existsSync(viewPath + '.htm')) {
                    const range = new vscode.Range(
                        new vscode.Position(method.loc!.start.line - 1, method.loc!.start.column),
                        new vscode.Position(method.loc!.end.line - 1, method.loc!.end.column)
                    );

                    const lens = new vscode.CodeLens(range);
                    lens.command = {
                        title: 'Go to view',
                        command: COMMAND_OPEN_CONTROLLER_VIEW,
                        tooltip: 'Open view for method',
                        arguments: [methodName]
                    };

                    codeLenses.push(lens);
                }
            }
        }

        return codeLenses;
    }
}

function openView(methodName: string) {
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        vscode.window.showErrorMessage('Document is not opened.');
        return;
    }

    const parsed = PluginFileUtils.parseFileName(document.fileName);
    if (parsed?.directory !== 'controllers') {
        return;
    }

    const directory = pluginsPath(
        path.join(parsed.vendor!, parsed.plugin!, 'controllers', parsed.classNameWithoutExt.toLowerCase())
    );
    if (!fs.existsSync(directory)) {
        vscode.window.showErrorMessage(`Directory ${directory} does not exists.`);
        return;
    }

    const files = fs
        .readdirSync(directory, { withFileTypes: true })
        .filter(el => el.isFile() && (el.name.endsWith('.php') || el.name.endsWith('.htm')));

    const fileNames: { [view: string]: string } = {};

    files.forEach(f => fileNames[f.name.split('.')[0]] = f.name);

    if (!fileNames[methodName]) {
        vscode.window.showInformationMessage(`View ${methodName} does not exists.`);
        return;
    }

    const viewFileName = fileNames[methodName];
    const viewPath = path.join(directory, viewFileName);

    vscode.window.showTextDocument(vscode.Uri.file(viewPath));
}
