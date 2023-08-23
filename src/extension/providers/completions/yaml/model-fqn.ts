import * as vscode from "vscode";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions } from "../../../helpers/completions";

const MODEL_CLASS_KEY = /modelClass:\s*/g;
const MODEL_CLASS_VALUE_PART = /^[\w\\]*$/;
const MODEL_CLASS_VALUE = /[\w\\]+/;

/**
 * Completions for model classes in yaml configs
 *
 * modelClass: Me\Blog\Models\Post
 */
export class ModelFqn implements vscode.CompletionItemProvider {

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
            MODEL_CLASS_KEY,
            MODEL_CLASS_VALUE_PART
        )) {
            return;
        }

        return project.models.map(model => {
            const item = CompletionItem.fromModel(model);
            item.range = document.getWordRangeAtPosition(position, MODEL_CLASS_VALUE);

            return item;
        });
    }
}
