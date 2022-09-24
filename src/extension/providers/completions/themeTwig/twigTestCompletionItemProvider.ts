import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { Themes } from "../../../../services/themes";
import { ThemeMarkupFile } from "../../../../types/theme/themeFile";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";
import { isRightAfter } from "../../../helpers/isRightAfter";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Twig tests completions
 *
 * {% if var is ... %}
 */
export class TwigTestCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        if (!LineSectionChecks.insideTwigSection(document, position)) {
            return;
        }

        if (!isRightAfter(document, position, regExps.twigStatementWithTestGlobal, regExps.spaces)) {
            return;
        }

        let completions = [];
        const tests = Project.instance.getTwigTests();

        for (const name in tests) {
            if (Object.prototype.hasOwnProperty.call(tests, name)) {
                const tag = tests[name];
                completions.push(CompletionItemFactory.fromTwigFilter(tag));
            }
        }

        return completions;
    }
}
