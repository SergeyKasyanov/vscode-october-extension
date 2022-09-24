import * as vscode from "vscode";
import * as yaml from 'yaml';
import { PluginFileUtils } from "../../../../helpers/pluginFileUtils";
import { regExps } from "../../../../helpers/regExps";
import { YamlFileUtils } from "../../../../helpers/yamlFileUtils";
import { Project } from "../../../../services/project";
import { ModelsDataLoader } from "../../../../services/project/modelsDataLoader";
import { Model } from "../../../../types/plugin/model";
import { isRightAfter } from "../../../helpers/isRightAfter";
import pluralize = require("pluralize");

export class YamlScopesCompletionItemProvider implements vscode.CompletionItemProvider {

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

        const isScopeAttr = isRightAfter(document, position, regExps.yamlScopeAttributeGlobal, regExps.spacesOrEmpty);
        const isSearchScope = isRightAfter(document, position, regExps.yamlSearchScopeAttributeGlobal, regExps.spacesOrEmpty);
        const isModelScope = isRightAfter(document, position, regExps.yamlModelScopeAttributeGlobal, regExps.spacesOrEmpty);

        const config = yaml.parse(this.document!.getText());
        const rootKeys = Object.keys(config);
        const firstRootKey = rootKeys[0];

        const isFieldsConfig = ['fields', 'tabs', 'secondaryTabs'].includes(firstRootKey);
        const isFilterConfig = firstRootKey === 'scopes';
        const isListConfig = rootKeys.includes('list');

        // fields.yaml, scope (type: relation, recordFinder)
        if (isScopeAttr && isFieldsConfig) {
            return this.getScopesForFields();
        }

        // fields.yaml, searchScope (type: recordFinder)
        if (isSearchScope && isFieldsConfig) {
            return this.getScopesForFields();
        }

        // config_filter.yaml, modelScope
        if (isModelScope && isFilterConfig) {
            return this.getScopesForFilterConfig();
        }

        // config_list.yaml, scope
        if (isScopeAttr && isListConfig) {
            return this.getScopesForListConfig();
        }

        return;
    }

    private getScopesForFilterConfig(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const parsed = PluginFileUtils.parseFileName(this.document!.fileName);
        if (!parsed) {
            return;
        }

        const controller = parsed.className!;
        const modelName = pluralize.singular(controller);
        const pluginCode = parsed.pluginCode;

        const model = Project.instance.getModel(pluginCode, modelName);
        if (!model) {
            return;
        }

        return this.getCompletionItems(model);
    }

    private getScopesForFields(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const type = YamlFileUtils.getSameLevelPropertyValue(this.document!, this.position!, 'type');
        if (!type) {
            return;
        }

        if (type === 'relation') {
            const parsed = PluginFileUtils.parseFileName(this.document!.fileName);
            if (!parsed) {
                return;
            }

            const pluginCode = parsed.pluginCode;
            const modelName = parsed.classNameWithoutExt;
            const relationName = YamlFileUtils.getParent(this.document!, this.position!.line);
            if (!relationName) {
                return;
            }

            const relation = Project.instance.getModelRelation(pluginCode, modelName, relationName);
            if (!relation) {
                return;
            }

            if (!relation.modelFqn) {
                return;
            }

            const model = ModelsDataLoader.instance.getModelByFqn(relation.modelFqn);
            if (!model) {
                return;
            }

            return this.getCompletionItems(model);
        }

        if (type === 'recordfinder') {
            const modelFqn = YamlFileUtils.getSameLevelPropertyValue(this.document!, this.position!, 'modelClass');
            if (!modelFqn) {
                return;
            }

            const model = ModelsDataLoader.instance.getModelByFqn(modelFqn);
            if (!model) {
                return;
            }

            return this.getCompletionItems(model);
        }
    }

    private getScopesForListConfig(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const parent = YamlFileUtils.getParent(this.document!, this.position!.line);
        if (parent !== 'search') {
            return;
        }

        const modelFqn = yaml.parse(this.document!.getText())['modelClass'];
        if (!modelFqn) {
            return;
        }

        const model = Project.instance.getModelByFqn(modelFqn);
        if (!model) {
            return;
        }

        return this.getCompletionItems(model);
    }

    private getCompletionItems(model: Model): vscode.CompletionItem[] {
        return model.scopes.map(scope => new vscode.CompletionItem(scope, vscode.CompletionItemKind.Method));
    }
}
