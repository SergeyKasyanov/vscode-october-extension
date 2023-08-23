import * as vscode from 'vscode';
import { Widget } from '../../../../domain/entities/classes/widget';
import { Store } from '../../../../domain/services/store';
import { awaitsCompletions } from '../../../helpers/completions';
import { BackendOwner } from '../../../../domain/entities/owners/backend-owner';
import { Controller } from '../../../../domain/entities/classes/controller';

const ATTRIBUTE_HANDLER = /data-(request|handler)=[\'\"]/g;
const GET_EVENT_HANDLER_CALL = /->getEventHandler\s*\(\s*[\'\"]/g;
const HANDLER_NAME_PART = /^[\w\_]*$/;
const HANDLER_NAME = /[\w\_]+/;

/**
 * Completions for:
 * - $this->getEventHandler('...') in widgets
 * - data-request="..." in controllers views
 * - data-handler="..." in controllers views
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

        let ajaxMethods;

        const entity = owner.findEntityByRelatedName(document.fileName) as Widget | Controller;
        if (entity instanceof Widget) {
            if (!awaitsCompletions(
                document.getText(),
                document.offsetAt(position),
                GET_EVENT_HANDLER_CALL,
                HANDLER_NAME_PART
            )) {
                return;
            }

            ajaxMethods = entity.ajaxMethods;
        } else if (entity instanceof Controller) {
            if (!awaitsCompletions(
                document.getText(),
                document.offsetAt(position),
                ATTRIBUTE_HANDLER,
                HANDLER_NAME_PART
            )) {
                return;
            }

            ajaxMethods = entity.ajaxMethods;

            const controllerBehaviors = Object.values(entity.behaviors).map(b => b.behavior);
            for (const behavior of controllerBehaviors) {
                ajaxMethods.push(...behavior.ajaxMethods);
            }

        } else {
            return;
        }

        return [...new Set(ajaxMethods)].sort().map(m => {
            const item = new vscode.CompletionItem(m, vscode.CompletionItemKind.Method);
            item.range = document.getWordRangeAtPosition(position, HANDLER_NAME);

            return item;
        });
    }

}
