import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { Themes } from "../../../../services/themes";
import { ThemeMarkupFile } from "../../../../types/theme/themeFile";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for content names in twig content tag.
 *
 * {% content '...' %}
 */
export class TwigContentCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!LineSectionChecks.insideTwigSection(document, position)) {
            return;
        }

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position, regExps.contentTagsStart);
        if (wordRange === undefined) {
            return;
        }

        return thisFile.theme.getContentsNames().map(filename =>
            new vscode.CompletionItem(filename, vscode.CompletionItemKind.EnumMember)
        );
    }
}
