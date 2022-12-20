import * as vscode from 'vscode';
import { Store } from '../../../../domain/services/store';
import { awaitsCompletions } from '../../../helpers/awaits-completions';

const TRANS_FUNCTION = /(\_|\_\_|trans)\([\'\"]/g;
const TRANS_KEY_PART = /^[\w\_\-\:\.]*$/;
const TRANS_KEY = /[\w\_\-\:\.]+/;

/**
 * Completions for language keys in php and twig code
 *
 * _('')
 * __('')
 * trans('')
 */
export class LangKey implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const file = Store.instance.findEntity(document.fileName);
        if (!file) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            TRANS_FUNCTION,
            TRANS_KEY_PART
        )) {
            return;
        }

        const projectTranslations = file.owner.project.translations;

        const completions = [];

        for (const key in projectTranslations) {
            if (Object.prototype.hasOwnProperty.call(projectTranslations, key)) {
                const value = projectTranslations[key];

                const item = new vscode.CompletionItem(key);
                item.range = document.getWordRangeAtPosition(position, TRANS_KEY);

                completions.push(item);
            }
        }

        return completions;
    }
}
