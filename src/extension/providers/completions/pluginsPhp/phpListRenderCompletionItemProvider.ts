import * as vscode from "vscode";
import { PluginFileUtils } from "../../../../helpers/pluginFileUtils";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class PhpListRenderCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (!parsed || parsed.directory !== 'controllers') {
            return;
        }

        if (!isRightAfter(document, position, regExps.phpListRenderMethodStartGlobal, regExps.empty)) {
            return;
        }

        const controller = Project.instance.getControllerByPluginCodeAndName(parsed.pluginCode, parsed.classNameWithoutExt);

        if (
            !controller
            || !controller.behaviors['\\Backend\\Behaviors\\ListController']
        ) {
            return;
        }

        const definitions = controller.behaviors['\\Backend\\Behaviors\\ListController'];

        return Object.keys(definitions).map(def =>
            new vscode.CompletionItem(def, vscode.CompletionItemKind.EnumMember)
        );
    }
}
