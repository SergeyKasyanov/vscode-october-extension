import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class YamlModelClassCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!isRightAfter(document, position, regExps.yamlModelClassTagGlobal, regExps.yamlModelClassValue)) {
            return;
        }

        let result: vscode.CompletionItem[] = [];

        const plugins = Object.keys(Project.instance.getPlugins());

        for (const code of plugins) {
            const models = Project.instance.getModelsFqnByPlugin(code);
            for (const model of models) {
                const item = new vscode.CompletionItem(model, vscode.CompletionItemKind.Class);

                const startChar = document.lineAt(position.line).text.indexOf(':');
                item.range = new vscode.Range(
                    new vscode.Position(position.line, startChar + 2),
                    new vscode.Position(position.line, model.length)
                );

                result.push(item);
            }
        }

        return result;
    }
}
