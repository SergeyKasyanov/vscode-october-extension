import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";

const CONTENT_TAG = /\{\%\s*content\s+[\'\"]/;
const CONTENT_FUNC = /((\{\{)|=)\s*content\s*\([\'\"]/;

/**
 * Completions for contents names in twig content tag or functions
 *
 * {% content '...' %}
 * {{ content('...') }}
 * {% set contentAsString = content('...') %}
 */
export class ContentName implements vscode.CompletionItemProvider {

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

        const wordRange = document.getWordRangeAtPosition(position, CONTENT_TAG)
            || document.getWordRangeAtPosition(position, CONTENT_FUNC);

        if (!wordRange) {
            return;
        }

        return themeFile.owner.contents.map(
            content => CompletionItem.fromContentFile(content)
        );
    }
}
