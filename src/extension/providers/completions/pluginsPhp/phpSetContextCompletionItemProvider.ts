import * as vscode from "vscode";
import { PluginFileUtils } from "../../../../helpers/pluginFileUtils";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class PhpSetContextCompletionItemProvider implements vscode.CompletionItemProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        const parsed = PluginFileUtils.parseFileName(document.fileName);

        if (!parsed || parsed.directory !== 'controllers') {
            return;
        }

        if (isRightAfter(document, position, regExps.phpSetContextMethodGlobal, regExps.phpSetContextFirstParamStart)) {
            return this.getOwner();
        }

        if (isRightAfter(document, position, regExps.phpSetContextMethodGlobal, regExps.phpSetContextSecondParamStart)) {
            return this.getMainMenu();
        }

        if (isRightAfter(document, position, regExps.phpSetContextMethodGlobal, regExps.phpSetContextThirdParamStart)) {
            return this.getSideMenu();
        }
    }

    private getOwner(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const plugins = Project.instance.getPlugins();

        return Object.keys(plugins).map(
            code => {
                const item = new vscode.CompletionItem(code, vscode.CompletionItemKind.Module);
                item.range = this.document!.getWordRangeAtPosition(this.position!, regExps.phpSetContextFirstParamWord);

                return item;
            }
        );
    }

    private getMainMenu(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        let lineText = this.document!.lineAt(this.position!.line).text;

        const setContextMatch = lineText.match(regExps.phpSetContextMethod);
        if (!setContextMatch || !setContextMatch.index) {
            return;
        }

        lineText = lineText.slice(setContextMatch.index + setContextMatch[0].length);

        const ownerMatch = lineText.match(regExps.phpSetContextParam);
        if (!ownerMatch) {
            return;
        }

        const plugin = Project.instance.getPlugin(ownerMatch[0].slice(1, -1));
        if (!plugin) {
            return;
        }

        return Object.keys(plugin.menu).map(
            code => new vscode.CompletionItem(code, vscode.CompletionItemKind.EnumMember)
        );
    }

    private getSideMenu(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        let lineText = this.document!.lineAt(this.position!.line).text;

        const setContextMatch = lineText.match(regExps.phpSetContextMethod);
        if (!setContextMatch || !setContextMatch.index) {
            return;
        }

        lineText = lineText.slice(setContextMatch.index + setContextMatch[0].length);

        const ownerMatch = lineText.match(regExps.phpSetContextParam);
        if (!ownerMatch || ownerMatch.index === undefined) {
            return;
        }

        const plugin = Project.instance.getPlugin(ownerMatch[0].slice(1, -1));
        if (!plugin) {
            return;
        }

        lineText = lineText.slice(ownerMatch.index + ownerMatch[0].length);

        const mainMenuMatch = lineText.match(regExps.phpSetContextParam);
        if (!mainMenuMatch || !mainMenuMatch.index) {
            return;
        }

        const sideMenus = plugin.menu[mainMenuMatch[0].slice(1, -1)];
        if (!sideMenus) {
            return;
        }

        return sideMenus.map(
            code => new vscode.CompletionItem(code, vscode.CompletionItemKind.EnumMember)
        );
    }
}
