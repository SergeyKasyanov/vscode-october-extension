import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { Themes } from "../../../../services/themes";
import { ThemeMarkupFile } from "../../../../types/theme/themeFile";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";
import { isRightAfter } from "../../../helpers/isRightAfter";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for twig filter names
 *
 * {{ 'some text'|... }}
 */
export class TwigFilterCompletionItemProvider implements vscode.CompletionItemProvider {

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

        if (!isRightAfter(document, position, regExps.twigStatementWithFilterGlobal, regExps.spacesOrEmpty)) {
            return;
        }

        let completions = [];
        const tags = Project.instance.getTwigFilters();

        for (const name in tags) {
            if (Object.prototype.hasOwnProperty.call(tags, name)) {
                const tag = tags[name];
                completions.push(CompletionItemFactory.fromTwigFilter(tag));
            }
        }

        return completions;
    }
}
