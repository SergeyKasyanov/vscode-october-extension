import * as vscode from 'vscode';
import { Store } from '../../../../domain/services/store';
import { awaitsCompletions } from '../../../helpers/awaits-completions';
import { getEvents } from '../../../../domain/entities/concerns/project-events';

const EVENT_LISTEN = /Event::listen\s*\(\s*[\'\"]/g;
const EVENT_NAME_PART = /^[\w\-\_\.\:]*$/;
const EVENT_NAME = /[\w\-\_\.\:]+/;

/**
 * Completions for event names in Event::listen('...')
 */
export class EventName implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            EVENT_LISTEN,
            EVENT_NAME_PART
        )) {
            return;
        }

        return getEvents(project).map(e => {
            const item = new vscode.CompletionItem(e, vscode.CompletionItemKind.EnumMember);
            item.range = document.getWordRangeAtPosition(position, EVENT_NAME);

            return item;
        });
    }
}
