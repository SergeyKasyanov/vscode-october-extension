import * as vscode from "vscode";
import * as yaml from 'yaml';
import { Controller } from "../../../../domain/entities/classes/controller";
import { Model } from "../../../../domain/entities/classes/model";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { Project } from "../../../../domain/entities/project";
import { Store } from "../../../../domain/services/store";
import { Str } from "../../../../helpers/str";
import { awaitsCompletions } from "../../../helpers/awaits-completions";
import { YamlHelpers } from "../../../helpers/yaml-helpers";

const SCOPE = /\s*scope\:\s*/g;
const SEARCH_SCOPE = /\s*searchScope\:\s*/g;
const MODEL_SCOPE = /\s*modelScope\:\s*/g;

const METHOD_NAME_PART = /^w*$/;
const METHOD_NAME = /w+/;

/**
 * Completions for scope method names
 *
 * - For form fields:
 *     category:
 *         label: Category
 *         type: relation
 *         scope: onlyActive <-- completes method name
 *     author:
 *         label: Author
 *         type: recordfinder
 *         searchScope: onlyActive <-- completes method name
 *
 * - For toolbar search:
 *     toolbar:
 *         buttons: list_toolbar
 *         search:
 *             prompt: backend::lang.list.search_prompt
 *             scope: searchBySomething <-- completes method name
 *
 * - For list filters:
 *     category:
 *         label: Category
 *         type: checkbox
 *         scope: onlyActive <-- completes method name
 */
export class ScopeMethod implements vscode.CompletionItemProvider {

    private document?: vscode.TextDocument;
    private position?: vscode.Position;
    private project?: Project;
    private owner?: BackendOwner;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        this.project = Store.instance.findProject(document.fileName);
        if (!this.project) {
            return;
        }

        this.owner = this.project.findOwner(document.fileName) as BackendOwner;
        if (!this.owner) {
            return;
        }

        const content = document.getText();
        const offset = document.offsetAt(position);

        const isScopeAttr = awaitsCompletions(content, offset, SCOPE, METHOD_NAME_PART);
        const isSearchScope = awaitsCompletions(content, offset, SEARCH_SCOPE, METHOD_NAME_PART);
        const isModelScope = awaitsCompletions(content, offset, MODEL_SCOPE, METHOD_NAME_PART);

        const config = yaml.parse(this.document!.getText());
        const rootKeys = Object.keys(config);
        const firstRootKey = rootKeys[0];

        const isFieldsConfig = ['fields', 'tabs', 'secondaryTabs'].includes(firstRootKey);
        const isFilterConfig = firstRootKey === 'scopes';
        const isListConfig = rootKeys.includes('list');

        // fields.yaml, scope (type: relation, recordfinder)
        if (isScopeAttr && isFieldsConfig) {
            return this.getScopesForFields();
        }

        // fields.yaml, searchScope (type: recordfinder)
        if (isSearchScope && isFieldsConfig) {
            return this.getScopesForFields();
        }

        // config_filter.yaml, modelScope
        if (isModelScope && isFilterConfig) {
            return this.getScopesForFilterConfig();
        }

        // config_filter.yaml, scope
        if (isScopeAttr && isFilterConfig) {
            return this.getScopesForFilterConfig();
        }

        // config_list.yaml, scope
        if (isScopeAttr && isListConfig) {
            return this.getScopesForListConfig();
        }
    }

    /**
     * Completions for "scope" and "searchScope" in relation and recordfinder fields.yaml
     *
     * @returns
     */
    private getScopesForFields(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const type = YamlHelpers.getSameParentProperty(this.document!, this.position!, 'type');
        if (!type) {
            return;
        }

        if (type === 'relation') {
            const model = this.owner!.findEntityByRelatedName(this.document!.fileName);
            if (!(model instanceof Model)) {
                return;
            }

            const relationName = YamlHelpers.getParent(this.document!, this.position!.line);
            if (!relationName) {
                return;
            }

            const relatedModel = model.relations[relationName];
            if (!relatedModel) {
                return;
            }

            return this.getCompletionItems(relatedModel);
        }

        if (type === 'recordfinder') {
            let modelFqn = YamlHelpers.getSameParentProperty(this.document!, this.position!, 'modelClass');
            if (!modelFqn) {
                return;
            }

            if (modelFqn.startsWith('\\')) {
                modelFqn = modelFqn.substring(1);
            }

            const model = this.project!.models.find(m => m.fqn === modelFqn);
            if (!model) {
                return;
            }

            return this.getCompletionItems(model);
        }
    }

    /**
     * Completions for "scope" and "modelScope" in config_filter.yaml
     *
     * @returns
     */
    private getScopesForFilterConfig(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const controller = this.owner!.findEntityByRelatedName(this.document!.fileName);
        if (!(controller instanceof Controller)) {
            return;
        }

        const modelUqn = Str.singular(controller.uqn);
        const model = this.owner!.models.find(m => m.uqn === modelUqn);
        if (!model) {
            return;
        }

        return this.getCompletionItems(model);
    }

    /**
     * Completions for "scope" in config_list.yaml/toolbar/search
     *
     * @returns
     */
    private getScopesForListConfig(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const parent = YamlHelpers.getParent(this.document!, this.position!.line);
        if (parent !== 'search') {
            return;
        }

        let modelFqn = yaml.parse(this.document!.getText())['modelClass'];
        if (!modelFqn) {
            return;
        }

        if (modelFqn.startsWith('\\')) {
            modelFqn = modelFqn.substring(1);
        }

        const model = this.owner!.models.find(m => m.fqn === modelFqn);
        if (!model) {
            return;
        }

        return this.getCompletionItems(model);
    }

    private getCompletionItems(model: Model): vscode.CompletionItem[] {
        return Object.keys(model.scopes).map(scope => {
            const item = new vscode.CompletionItem(scope, vscode.CompletionItemKind.Method);
            item.range = this.document!.getWordRangeAtPosition(this.position!, METHOD_NAME);

            return item;
        });
    }
}
