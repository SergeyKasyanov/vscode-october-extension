import * as vscode from "vscode";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const ENV_FUNCTION = /env\([\'\"]/g;
const ENV_KEY_PART = /^[\w\_]*$/;
const ENV_KEY = /[\w\_]+/;

/**
 * Completions for keys in .env file
 *
 * env('...')
 */
export class EnvVariable implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            ENV_FUNCTION,
            ENV_KEY_PART
        )) {
            return;
        }

        return project.envVariables.map(envVariable => {
            const item = new vscode.CompletionItem(envVariable.key, vscode.CompletionItemKind.EnumMember);
            item.range = document.getWordRangeAtPosition(position, ENV_KEY);

            if (envVariable.value) {
                item.detail = envVariable.value;
            }

            return item;
        });
    }
}
