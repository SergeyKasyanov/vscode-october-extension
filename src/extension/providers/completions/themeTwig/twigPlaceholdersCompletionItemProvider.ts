import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { Themes } from "../../../../services/themes";
import { Page } from "../../../../types/theme/page";
import { isRightAfter } from "../../../helpers/isRightAfter";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions with placeholders names in put tag param
 *
 * {% put '...' %}
 */
export class TwigPlaceholdersCompletionItemProvider implements vscode.CompletionItemProvider {

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
        if (!(thisFile instanceof Page)) {
            return;
        }

        const layoutName = thisFile.layoutName;
        if (!layoutName) {
            return;
        }

        if (!isRightAfter(document, position, regExps.putTagStartsGlobal, regExps.spacesOrEmpty)) {
            return;
        }

        const layout = thisFile.theme.getLayout(layoutName);
        if (!layout) {
            return;
        }

        return layout.placeholders.map(
            placeholder => new vscode.CompletionItem(placeholder, vscode.CompletionItemKind.Constant)
        );
    }
}
