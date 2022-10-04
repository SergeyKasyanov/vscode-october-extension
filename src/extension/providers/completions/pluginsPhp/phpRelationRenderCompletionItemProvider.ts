import { parse } from "path";
import * as vscode from "vscode";
import { PluginFileUtils } from "../../../../helpers/pluginFileUtils";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class PhpRelationRenderCompletionItemProvider implements vscode.CompletionItemProvider {

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

        if (!isRightAfter(document, position, regExps.phpRelationRenderMethodStartGlobal, regExps.empty)) {
            return;
        }

        const controller = Project.instance.getControllerByPluginCodeAndName(parsed.pluginCode, parsed.classNameWithoutExt);

        if (
            !controller
            || !controller.behaviors['\\Backend\\Behaviors\\RelationController']
            || !controller.behaviors['\\Backend\\Behaviors\\RelationController']['default']
            || !controller.behaviors['\\Backend\\Behaviors\\RelationController']['default'].config
        ) {
            return;
        }

        const behaviorConfig = controller.behaviors['\\Backend\\Behaviors\\RelationController']['default'].config;

        return Object.keys(behaviorConfig).map(def =>
            new vscode.CompletionItem(def, vscode.CompletionItemKind.EnumMember)
        );
    }
}
