import * as vscode from "vscode";
import { PluginFileUtils } from "../../../../helpers/pluginFileUtils";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class YamlColumnRelationCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (parsed?.directory !== 'models') {
            return;
        }

        if (!isRightAfter(document, position, regExps.yamlRelationPropertyAttributeGlobal, regExps.spaces)) {
            return;
        }

        let result: vscode.CompletionItem[] = [];

        const model = Project.instance.getModel(parsed.pluginCode, parsed.classNameWithoutExt);
        if (!model) {
            return;
        }

        for (const rel of Object.keys(model.relations)) {
            result.push(new vscode.CompletionItem(rel, vscode.CompletionItemKind.Property));
        }

        return result;
    }
}
