import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { ThemeFileUtils } from "../../../../helpers/themeFileUtils";
import { Themes } from "../../../../services/themes";
import { ThemeMarkupFile } from "../../../../types/theme/themeFile";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";
import { isRightAfter } from "../../../helpers/isRightAfter";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for component property names in twig component tag.
 *
 * {% component 'compName' propName =  %}
 */
export class TwigComponentPropertiesCompletionItemProvider implements vscode.CompletionItemProvider {

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
        if (!thisFile || !(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        if (!isRightAfter(document, position, regExps.componentTagStartGlobal, regExps.componentParams)) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position, regExps.componentTagWithParams);
        if (!wordRange) {
            return;
        }

        const components = ThemeFileUtils.getComponents(thisFile, true);

        const word = document.lineAt(position.line).text.slice(wordRange.start.character, wordRange.end.character);
        const tagMatch = word.match(regExps.componentTag);
        if (!tagMatch) {
            return;
        }

        const componentAlias = tagMatch[0].replace(regExps.componentTagStart, '').slice(0, -1);
        const component = components[componentAlias];
        if (!component) {
            return;
        }

        let completions = [];

        for (const name in component.data.props) {
            if (Object.prototype.hasOwnProperty.call(component.data.props, name)) {
                const prop = component.data.props[name];
                completions.push(CompletionItemFactory.fromComponentProperty(prop));
            }
        }

        return completions;
    }
}
