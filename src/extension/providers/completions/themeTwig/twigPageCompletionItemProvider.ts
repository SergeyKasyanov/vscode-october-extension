import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { Themes } from "../../../../services/themes";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for page names in page filtered strings
 *
 * {{ '...'|page }}
 */
export class TwigPageCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!LineSectionChecks.insideTwigSection(document, position)) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position, regExps.pageFilteredStringTag);
        if (!wordRange) {
            return;
        }

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!thisFile) {
            return;
        }

        return thisFile.theme.getPageNames().map(page =>
            new vscode.CompletionItem(page, vscode.CompletionItemKind.EnumMember)
        );
    }
}
