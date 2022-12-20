import * as vscode from "vscode";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const ENV_FUNCTION = /env\([\'\"]/g;
const ENV_KEY_PART = /^[\w\_]*$/;

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

        const file = Store.instance.findEntity(document.fileName);
        if (!file) {
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

        return Object.keys(file.owner.project.envVariables).map(
            key => new vscode.CompletionItem(key, vscode.CompletionItemKind.EnumMember)
        );
    }
}
