import * as vscode from "vscode";
import { Model } from "../../../../domain/entities/classes/model";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const RELATION_KEY = /\s*relation:\s*/g;
const RELATION_NAME_PART = /^\w*$/;

/**
 * Completions for relation names in yaml configs
 *
 *     category_name:
 *         label: Category
 *         relation: category
 *         select: name
 */
export class RelationName implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            RELATION_KEY,
            RELATION_NAME_PART
        )) {
            return;
        }

        const owner = Store.instance.findOwner(document.fileName) as BackendOwner;
        if (!(owner instanceof BackendOwner)) {
            return;
        }

        const model = owner.findEntityByRelatedName(document.fileName);
        if (!(model instanceof Model)) {
            return;
        }

        const result: vscode.CompletionItem[] = [];
        const relations = model.relations;

        for (const relation in relations) {
            if (Object.prototype.hasOwnProperty.call(relations, relation)) {
                const relatedClass = relations[relation];

                const item = new vscode.CompletionItem(relation, vscode.CompletionItemKind.Property);
                item.detail = relatedClass.fqn;

                result.push(item);
            }
        }

        return result;
    }
}
