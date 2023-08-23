import * as vscode from "vscode";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/completions";

const RECORD_URL_KEY = /recordUrl:\s*/g;
const URL_PART = /^[\w\-\_\/]*$/;
const URL = /[\w\-\_\/]+/;

/**
 * Completions for recordUrl yaml property
 */
export class RecordUrl implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        if (!awaitsCompletions(document.getText(), document.offsetAt(position), RECORD_URL_KEY, URL_PART)) {
            return;
        }

        return project.backendUrls.map(url => {
            const item = new vscode.CompletionItem(url);
            item.range = document.getWordRangeAtPosition(position, URL);

            return item;
        });
    }
}
