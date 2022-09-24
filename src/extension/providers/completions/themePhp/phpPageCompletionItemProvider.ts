import * as vscode from 'vscode';
import { regExps } from "../../../../helpers/regExps";
import { Themes } from "../../../../services/themes";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class PhpPageCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!isRightAfter(document, position, regExps.phpPageUrlMethodGlobal, regExps.phpPageUrlMethodParam)) {
            return;
        }

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!thisFile) {
            return;
        }

        return thisFile.theme.getPageNames().map(page => {
            const item = new vscode.CompletionItem(page, vscode.CompletionItemKind.EnumMember);
            item.range = document.getWordRangeAtPosition(position, regExps.phpPageUrlMethodParamWord);

            return item;
        });
    }
}
