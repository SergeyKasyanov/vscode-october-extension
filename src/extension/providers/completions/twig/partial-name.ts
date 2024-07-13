import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions } from "../../../helpers/completions";

const PARTIAL_TAG = /\{\%\s*(partial|ajaxPartial)\s+[\'\"]/g;
const PARTIAL_FUNC = /((\{\{)|=)\s*partial\s*\([\'\"]/g;
const PARTIAL_NAME_PART = /^[\w\-\_\/]*$/;
const PARTIAL_NAME = /[\w\-\_\/]+/;

/**
 * Completions for partials names in twig partial tag or functions
 *
 * {% partial '...' %}
 * {% ajaxPartial '...' %}
 * {{ partial('...') }}
 * {% set partialAsString = partial('...') %}
 */
export class PartialName implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideTwig(document.offsetAt(position))) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            [PARTIAL_TAG, PARTIAL_FUNC],
            PARTIAL_NAME_PART
        )) {
            return;
        }

        return themeFile.owner.partials.map(partial => {
            const item = CompletionItem.fromThemeMarkupFile(partial);
            item.range = document.getWordRangeAtPosition(position, PARTIAL_NAME);

            return item;
        });
    }
}
