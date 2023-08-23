import * as vscode from "vscode";
import { Controller } from "../../../../domain/entities/classes/controller";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/completions";

const ACTION_METHOD_CALL = /->actionUrl\s*\(\s*[\'\"]/g;
const ACTION_NAME_PART = /^[\w\-\_]*$/;
const ACTION_NAME = /[\w\-\_]+/;

/**
 * Completions for controller's action name
 *
 * $this->action('...')
 */
export class ControllerAction implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const owner = Store.instance.findOwner(document.fileName);
        if (!(owner instanceof BackendOwner)) {
            return;
        }

        const controller = owner.findEntityByPath(document.fileName)
            || owner.findEntityByRelatedName(document.fileName);

        if (!(controller instanceof Controller)) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            ACTION_METHOD_CALL,
            ACTION_NAME_PART
        )) {
            return;
        }

        const controllerBehaviors = Object.values(controller.behaviors).map(b => b.behavior);

        const pages = Object.keys(controller.pageMethods);
        for (const beh of controllerBehaviors) {
            pages.push(...beh.pageMethods);
        }

        return [...new Set(pages)].map(page => {
            const item = new vscode.CompletionItem(page, vscode.CompletionItemKind.Method);
            item.range = document.getWordRangeAtPosition(position, ACTION_NAME);

            return item;
        });
    }
}
