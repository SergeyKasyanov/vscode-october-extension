import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";

/**
 * Completions for component names in INI section of theme files.
 *
 * [blogPost]
 */
export class ComponentName implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideIni(document.offsetAt(position))) {
            return;
        }

        if (!document.lineAt(position.line).text.startsWith('[')) {
            return;
        }

        const result: vscode.CompletionItem[] = [];

        for (const component of themeFile.owner.project.components) {
            const alias = component.defaultAlias;
            if (!alias) {
                continue;
            }

            result.push(CompletionItem.fromComponent(component));
        }

        return result;
    }
}
