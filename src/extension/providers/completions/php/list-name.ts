import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { Controller } from "../../../../domain/entities/classes/controller";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const LIST_RENDER_METHOD = /->listRender\s*\(\s*[\'\"]/g;
const LIST_NAME_PART = /^\w*$/;

/**
 * Completions for list name in listRender() method
 *
 * $this->listRender('...')
 */
export class ListName implements vscode.CompletionItemProvider {

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

        const listController = Object.values(controller.behaviors)
            .map(b => b.behavior)
            .find(beh => beh.fqn === 'Backend\\Behaviors\\ListController');
        if (!listController) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            LIST_RENDER_METHOD,
            LIST_NAME_PART
        )) {
            return;
        }

        const properties = controller.phpClassProperties;
        const listConfig = properties?.listConfig;
        if (!listConfig || listConfig.value?.kind !== 'array') {
            return;
        }

        const definitions: string[] = [];

        (listConfig.value as phpParser.Array).items.map(_item => {
            const item = _item as phpParser.Entry;
            if (item.key?.kind === 'string') {
                definitions.push((item.key as phpParser.String).value);
            }
        });

        return definitions.map(def =>
            new vscode.CompletionItem(def, vscode.CompletionItemKind.EnumMember)
        );
    }
}
