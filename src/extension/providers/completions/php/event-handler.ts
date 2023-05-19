import * as vscode from 'vscode';
import { Widget } from '../../../../domain/entities/classes/widget';
import { Store } from '../../../../domain/services/store';
import { awaitsCompletions } from '../../../helpers/awaits-completions';
import { BackendOwner } from '../../../../domain/entities/owners/backend-owner';

const GET_EVENT_HANDLER_CALL = /->getEventHandler\s*\(\s*[\'\"]/g;
const HANDLER_NAME_PART = /^[\w\_]*$/;
const HANDLER_NAME = /[\w\_]+/;

/**
 * Completions for $this->getEventHandler('...') in widgets
 */
export class EventHandler implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const owner = Store.instance.findOwner(document.fileName) as BackendOwner;
        if (!owner) {
            return;
        }

        const widget = owner.findEntityByRelatedName(document.fileName) as Widget;
        if (!(widget instanceof Widget)) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            GET_EVENT_HANDLER_CALL,
            HANDLER_NAME_PART
        )) {
            return;
        }

        return widget.ajaxMethods.map(m => {
            const item = new vscode.CompletionItem(m, vscode.CompletionItemKind.Method);
            item.range = document.getWordRangeAtPosition(position, HANDLER_NAME);

            return item;
        });
    }

}
