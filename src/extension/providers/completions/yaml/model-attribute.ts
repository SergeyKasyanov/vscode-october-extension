import * as vscode from "vscode";
import { Model } from "../../../../domain/entities/classes/model";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { Store } from "../../../../domain/services/store";
import { Str } from "../../../../helpers/str";
import { awaitsCompletions } from "../../../helpers/awaits-completions";
import { YamlHelpers } from "../../../helpers/yaml-helpers";

const DISPLAY_FROM_KEY = /displayFrom:\s*/g;
const DISPLAY_FROM_VALUE_PART = /^[\w\\]*$/;

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

        if (awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            DISPLAY_FROM_KEY,
            DISPLAY_FROM_VALUE_PART
        )) {
            return this.completions(model);
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

        return this.completions(model, true);
    }

    private completions(model: Model, withLabel: boolean = false): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        return [...new Set([
            ...model.attributes,
            ...model.guessAttributes,
            ...Object.keys(model.relations)
        ])].sort().map(attr => {
            const item = new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property);
            if (!withLabel) {
                return item;
            }

            const label = Str.pascalCase(attr);

            item.insertText = new vscode.SnippetString(
                `${attr}:
    label: \${1:${label}}
    $0`);

            return item;
        });
    }
}
