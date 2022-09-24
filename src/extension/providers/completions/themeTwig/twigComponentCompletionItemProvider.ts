import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { ThemeFileUtils } from "../../../../helpers/themeFileUtils";
import { Themes } from "../../../../services/themes";
import { ThemeMarkupFile } from "../../../../types/theme/themeFile";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for component names in twig component tag.
 *
 * {% component '...' %}
 */
export class TwigComponentCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!LineSectionChecks.insideTwigSection(document, position)) {
            return [];
        }

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!thisFile || !(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position, regExps.componentTagStart);
        if (!wordRange) {
            return [];
        }

        let result = [];

        const components = ThemeFileUtils.getComponents(thisFile, true);

        for (const alias in components) {
            if (Object.prototype.hasOwnProperty.call(components, alias)) {
                const component = components[alias];

                result.push(CompletionItemFactory.fromComponent(component, alias));
            }
        }

        return result;
    }
}
