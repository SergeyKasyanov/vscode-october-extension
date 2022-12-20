import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";

const STR_PAGE_FILTERED = /[\'\"][\w\/.\-]*[\'\"]\s*\|\s*page/;
const PAGE_NAME = /[\w\_\-\/\.]+/;

/**
 * Completions for page names in page filtered strings
 *
 * {{ '...'|page }}
 */
export class PageName implements vscode.CompletionItemProvider {

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

        const wordRange = document.getWordRangeAtPosition(position, STR_PAGE_FILTERED);
        if (!wordRange) {
            return;
        }

        return themeFile.owner.pages.map(page => {
            const item = CompletionItem.fromThemeMarkupFile(page);
            item.range = document.getWordRangeAtPosition(position, PAGE_NAME);

            return item;
        });
    }
}
