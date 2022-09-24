import * as vscode from "vscode";
import { getClassMethodsFromDocument } from "../../../../helpers/parsePhp";
import { regExps } from "../../../../helpers/regExps";
import { isRightAfter } from "../../../helpers/isRightAfter";
import ocIcons from "../../../staticData/ocIcons";

export class PhpPluginIconCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!document.fileName.endsWith('Plugin.php')) {
            return;
        }

        const methods = getClassMethodsFromDocument(document.getText(), document.fileName);
        let ranges = [];

        if (methods?.registerNavigation.loc) {
            const loc = methods?.registerNavigation.loc;

            ranges.push(new vscode.Range(
                new vscode.Position(loc.start.line - 1, loc.start.column),
                new vscode.Position(loc.end.line - 1, loc.end.column)
            ));
        }

        if (methods?.pluginDetails.loc) {
            const loc = methods?.pluginDetails.loc;

            ranges.push(new vscode.Range(
                new vscode.Position(loc.start.line - 1, loc.start.column),
                new vscode.Position(loc.end.line - 1, loc.end.column)
            ));
        }

        let contains = false;
        for (const range of ranges) {
            if (range.contains(position)) {
                contains = true;
                break;
            }
        }

        if (!contains) {
            return;
        }

        if (!isRightAfter(document, position, regExps.phpPluginNavIconGlobal, regExps.empty)) {
            return;
        }

        return ocIcons.map(icon => new vscode.CompletionItem('icon-' + icon, vscode.CompletionItemKind.Enum));
    }
}
