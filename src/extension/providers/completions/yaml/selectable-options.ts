import * as vscode from "vscode";
import * as yaml from 'yaml';
import { Model } from "../../../../domain/entities/classes/model";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";
import { YamlHelpers } from "../../../helpers/yaml-helpers";

const OPTIONS_KEY = /\s*options\:\s*/g;
const METHOD_NAME_PART = /^w*$/;
const METHOD_NAME = /w+/;

/**
 * Completions for selectable options in yaml configs
 *
 * For form fields:
 *     category_id:
 *         label: Category
 *         type: dropdown
 *         options: getCategoryIdOptions <-- completes method name
 *
 * For list filters:
 *     category_id:
 *         label: Category
 *         type: group
 *         modelClass: App\Models\Post
 *         options: getCategoryIdOptions <-- completes method name
 */
export class SelectableOptions implements vscode.CompletionItemProvider {

    private document?: vscode.TextDocument;
    private position?: vscode.Position;
    private owner?: BackendOwner;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        this.owner = Store.instance.findOwner(document.fileName) as BackendOwner;
        if (!(this.owner instanceof BackendOwner)) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            OPTIONS_KEY,
            METHOD_NAME_PART
        )) {
            return;
        }

        const config = yaml.parse(document.getText());
        const root = Object.keys(config)[0];

        if (['columns', 'fields', 'tabs', 'secondaryTabs'].includes(root)) {
            return this.getCompletionsForModel();
        }

        if (root === 'scopes') {
            return this.getCompletionsForFilters();
        }
    }

    private getCompletionsForModel(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const model = this.owner!.findEntityByRelatedName(this.document!.fileName);
        if (!(model instanceof Model)) {
            return;
        }

        const possible = ['selectable', 'dropdown', 'radio', 'balloon-selector', 'checkboxlist', 'taglist'];

        const fieldType = YamlHelpers.getSameParentProperty(this.document!, this.position!, 'type');
        if (!fieldType || !possible.includes(fieldType)) {
            return;
        }

        return model.optionsMethods.map(method => {
            const item = new vscode.CompletionItem(method, vscode.CompletionItemKind.Method);
            item.range = this.document!.getWordRangeAtPosition(this.position!, METHOD_NAME);

            return item;
        });
    }

    private getCompletionsForFilters(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const possible = ['group', 'dropdown'];

        const fieldType = YamlHelpers.getSameParentProperty(this.document!, this.position!, 'type');
        if (!fieldType || !possible.includes(fieldType)) {
            return;
        }

        const modelClass = YamlHelpers.getSameParentProperty(this.document!, this.position!, 'modelClass');
        if (!modelClass) {
            return;
        }

        const model = this.owner!.findEntityByFqn(modelClass);
        if (!(model instanceof Model)) {
            return;
        }

        return model.optionsMethods.map(method => {
            const item = new vscode.CompletionItem(method, vscode.CompletionItemKind.Method);
            item.range = this.document!.getWordRangeAtPosition(this.position!, METHOD_NAME);

            return item;
        });
    }
}
