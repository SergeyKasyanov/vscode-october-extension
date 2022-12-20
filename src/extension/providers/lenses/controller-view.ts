import * as vscode from 'vscode';
import { Controller } from '../../../domain/entities/classes/controller';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { Store } from '../../../domain/services/store';
import { phpSelector } from '../../helpers/file-selectors';
import path = require('path');

const COMMAND_OPEN_CONTROLLER_VIEW = 'command.openControllerView';

export function registerControllerViewLensProvider(context: vscode.ExtensionContext) {
    vscode.languages.registerCodeLensProvider(phpSelector, new ControllerView());

    vscode.commands.registerCommand(COMMAND_OPEN_CONTROLLER_VIEW, openView);
}

/**
 * Lenses for controller page methods
 * with link to corresponding view.
 */
class ControllerView implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {

        const controller = Store.instance.findEntity(document.fileName);
        if (!(controller instanceof Controller)) {
            return;
        }

        const viewsDir = controller.filesDirectory;
        const pageMethods = controller.pageMethods;

        const codeLenses: vscode.CodeLens[] = [];

        for (const methodName in pageMethods) {
            if (Object.prototype.hasOwnProperty.call(pageMethods, methodName)) {
                const range = new vscode.Range(
                    pageMethods[methodName].start.translate(-1),
                    pageMethods[methodName].end.translate(-1)
                );

                let viewPath: string | undefined;

                for (const ext of controller.owner.project.platform!.backendViewExtensions) {
                    const candidate = path.join(viewsDir, methodName) + '.' + ext;
                    if (FsHelpers.exists(candidate)) {
                        viewPath = candidate;
                        break;
                    }
                }

                if (!viewPath) {
                    continue;
                }

                codeLenses.push(new vscode.CodeLens(range, {
                    title: 'Go to view',
                    command: COMMAND_OPEN_CONTROLLER_VIEW,
                    tooltip: 'Open view for method',
                    arguments: [viewPath]
                }));
            }
        }

        return codeLenses;
    }
}

async function openView(viewPath: string) {
    vscode.window.showTextDocument(vscode.Uri.file(viewPath));
}
