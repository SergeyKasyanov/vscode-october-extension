import * as vscode from "vscode";
import { Project } from "../../../../services/project";
import { isRightAfter } from "../../../helpers/isRightAfter";
import { pluginsPath } from "../../../../helpers/paths";
import { regExps } from "../../../../helpers/regExps";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";

/**
 * Completions for config keys in php files.
 *
 * config('...')
 * config(['...'])
 * Config::get('...')
 * Config::get(['...'])
 */
export class PhpConfigCompletionItemProvider implements vscode.CompletionItemProvider {

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

        if (!document.fileName.startsWith(pluginsPath())) {
            return [];
        }

        let result = [];

        if (!this.isGetConfigMethod()) {
            return;
        }

        let configs = Project.instance.getConfigs();

        for (const key in configs) {
            if (Object.prototype.hasOwnProperty.call(configs, key)) {
                const ocConfigKey = configs[key];

                const item = CompletionItemFactory.fromConfigKey(ocConfigKey);
                item.range = document.getWordRangeAtPosition(position, regExps.configWord);

                result.push(item);
            }
        }

        return result;
    }

    private isGetConfigMethod(): boolean {
        return isRightAfter(
            this.document!,
            this.position!,
            regExps.getConfigMethodGlobal,
            regExps.getConfigMethodArgs
        );
    }
}
