import * as vscode from "vscode";
import { Page } from "../../../../domain/entities/theme/page";
import { Store } from "../../../../domain/services/store";

const LAYOUT_NAME = /[\w\/]+/;

/**
 * Completions for layout names in INI section of theme files.
 *
 * layout = "layoutName"
 */
export class LayoutName implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const page = Store.instance.findEntity(document.fileName);
        if (!(page instanceof Page)) {
            return;
        }

        if (!page.isOffsetInsideFileConfig(document.offsetAt(position))) {
            return;
        }

        const beforeCursor = document.lineAt(position.line).text.slice(0, position.character);
        if (!beforeCursor.match(/layout\s*=\s*[\'\"]/)) {
            return;
        }

        return page.owner.layouts.map(layout => {
            const item = new vscode.CompletionItem(layout.name, vscode.CompletionItemKind.EnumMember);
            item.range = document.getWordRangeAtPosition(position, LAYOUT_NAME);

            return item;
        });
    }
}
