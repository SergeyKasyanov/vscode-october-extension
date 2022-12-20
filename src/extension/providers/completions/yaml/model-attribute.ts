import * as vscode from "vscode";
import { Model } from "../../../../domain/entities/classes/model";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { Store } from "../../../../domain/services/store";
import { YamlHelpers } from "../../../helpers/yaml-helpers";

/**
 * Completions for model attributes in it's config file (fields.yaml or columns.yaml)
 */
export class ModelAttribute implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const owner = Store.instance.findOwner(document.fileName);
        if (!(owner instanceof BackendOwner)) {
            return;
        }

        const model = owner.findEntityByRelatedName(document.fileName);
        if (!(model instanceof Model)) {
            return;
        }

        const parent = YamlHelpers.getParent(document, position.line);
        if (!parent || !['columns', 'fields'].includes(parent)) {
            return;
        }

        const lineText = document.lineAt(position).text;
        const prefix = lineText.slice(0, position.character);
        if (prefix.trim() !== '') {
            return;
        }

        return [...new Set([
            ...model.attributes,
            ...model.guessAttributes,
            ...Object.keys(model.relations)
        ])].sort().map(
            attr => new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property)
        );
    }
}
