import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { Themes } from "../../../../services/themes";
import { ThemeMarkupFile } from "../../../../types/theme/themeFile";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for partials names in twig partial tag or functions
 *
 * {% partial '...' %}
 * {{ partial('...') }}
 * {% set partialAsString = partial('...') %}
 */
export class TwigPartialCompletionItemProvider implements vscode.CompletionItemProvider {

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

        const wordRange = document.getWordRangeAtPosition(position, regExps.partialTagStart)
            || document.getWordRangeAtPosition(position, regExps.partialFunctionStart);

        if (!wordRange) {
            return;
        }

        return thisFile.theme.getPartialsNames().map(partial =>
            new vscode.CompletionItem(partial, vscode.CompletionItemKind.EnumMember)
        );
    }
}
