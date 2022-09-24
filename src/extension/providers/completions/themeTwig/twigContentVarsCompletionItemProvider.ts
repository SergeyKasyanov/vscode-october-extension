import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { Themes } from "../../../../services/themes";
import { ThemeMarkupFile } from "../../../../types/theme/themeFile";
import { isRightAfter } from "../../../helpers/isRightAfter";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for content vars in twig content tag.
 *
 * {% content 'content.txt' varName =  %}
 */
export class TwigContentVarsCompletionItemProvider implements vscode.CompletionItemProvider {

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

        if (!isRightAfter(document, position, regExps.contentTagGlobal, /^\s*$/)) {
            return;
        }

        const contentTagMatch = document.lineAt(position.line).text.match(regExps.contentTag);
        if (!contentTagMatch) {
            return;
        }

        const contentName = contentTagMatch[0].match(regExps.contentName)![0].slice(1, -1);
        const content = thisFile.theme.getContent(contentName);
        if (!content) {
            return;
        }

        return content.echoedVars
            .map(variable => {
                let item = new vscode.CompletionItem(variable, vscode.CompletionItemKind.Variable);
                item.insertText = variable + ' = ';
                return item;
            });
    }
}
