import * as vscode from "vscode";
import * as yaml from 'yaml';
import { Controller } from "../../../domain/entities/classes/controller";
import { Model } from "../../../domain/entities/classes/model";
import { OctoberClass } from "../../../domain/entities/classes/october-class";
import { BackendOwner } from "../../../domain/entities/owners/backend-owner";
import { Project } from "../../../domain/entities/project";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../domain/helpers/path-helpers";
import { Store } from "../../../domain/services/store";
import { Str } from '../../../helpers/str';
import { resolveViewPath } from "../../helpers/view-path-resolver";
import { YamlHelpers } from "../../helpers/yaml-helpers";
import { DocumentLink as _DocumentLInk } from '../../types/document-link';

const PATH_PAIR = /(path|toolbarPartial|buttons|form|list|groups|filter):\s*[\$\~]{0,1}[\'\"]{0,1}[\w\-\_\.\/]+[\'\"]{0,1}/g;
const VIEW_PAIR = /path:\s*[\'\"]{0,1}[\w\-\_\.\/]+::[\w\-\_\.\/]+[\'\"]{0,1}/g;
const MODEL_CLASS_PAIR = /modelClass:\s*[\w\\\_]+/g;
const OPTIONS_PAIR = /options:\s*[\w\\\:\_]+/g;
const SCOPE_PAIR = /(scope|searchScope|modelScope):\s*[\w\_]+/g;

/**
 * Document links for partials, configs and models in yaml configs
 */
export class YamlFiles implements vscode.DocumentLinkProvider {

    private document?: vscode.TextDocument;
    private project?: Project;
    private owner?: BackendOwner;
    private entity?: OctoberClass;

    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {

        this.document = document;
        this.project = Store.instance.findProject(document.fileName);
        if (!this.project) {
            return;
        }

        const owner = this.project.findOwner(document.fileName) as BackendOwner;
        this.entity = owner!.findEntityByRelatedName(document.fileName) as OctoberClass;

        const content = this.document!.getText();

        return [
            ...this.processMatches(document, content.matchAll(PATH_PAIR), 'file'),
            ...this.processMatches(document, content.matchAll(VIEW_PAIR), 'view'),
            ...this.processMatches(document, content.matchAll(MODEL_CLASS_PAIR), 'model'),
            ...this.processMatches(document, content.matchAll(OPTIONS_PAIR), 'options'),
            ...this.processMatches(document, content.matchAll(SCOPE_PAIR), 'scope'),
        ];
    }

    private processMatches(
        document: vscode.TextDocument,
        matches: IterableIterator<RegExpMatchArray>,
        mode: LinkMode
    ): DocumentLink[] {
        const links = [];

        for (const match of matches) {
            const line = this.document!.positionAt(match.index!).line;
            const value = YamlHelpers.getKeyAndValue(this.document!.lineAt(line).text).value;
            if (!value) {
                continue;
            }

            if (mode === 'file' && value.includes('::')) {
                continue;
            }

            const valueOffset = match[0].indexOf(value);

            const start = document.positionAt(match.index! + valueOffset);
            const end = start.translate(0, value.length);
            const range = new vscode.Range(start, end);

            const link = new DocumentLink(document, range);
            link.mode = mode;

            links.push(link);
        }

        return links;
    }

    resolveDocumentLink(link: DocumentLink): vscode.ProviderResult<vscode.DocumentLink> {
        const value = link.markedText;

        switch (link.mode) {
            case 'file':
                return this.resolveFileLink(value, link);
            case 'model':
                return this.resolveModelLink(value, link);
            case 'options':
                return this.resolveOptionsLink(value, link);
            case 'scope':
                return this.resolveScopeLink(value, link);
            case 'view':
                return this.resolveViewLink(value, link);
        }
    }

    private resolveFileLink(value: string, link: DocumentLink): vscode.ProviderResult<vscode.DocumentLink> {
        let controller: Controller | undefined;

        if (this.entity instanceof Model) {
            controller = this.entity!.controller;
        } else if (this.entity instanceof Controller) {
            controller = this.entity!;
        }

        const filePath = PathHelpers.relativePath(
            this.project!.path,
            value,
            controller
        );

        if (filePath && FsHelpers.exists(filePath) && FsHelpers.isFile(filePath)) {
            link.target = vscode.Uri.file(filePath);

            return link;
        }

        return;
    }

    private resolveModelLink(value: string, link: DocumentLink): vscode.ProviderResult<vscode.DocumentLink> {
        const modelFqn = value.startsWith('\\')
            ? value.slice(1)
            : value;

        const model = this.project!.models.find(m => m.fqn === modelFqn);
        if (!model) {
            vscode.window.showErrorMessage('Model does not exists');
            return;
        }

        link.target = vscode.Uri.file(model.path)
            .with({ fragment: model.classPositionForLinks });

        return link;
    }

    private resolveOptionsLink(value: string, link: DocumentLink): vscode.ProviderResult<vscode.DocumentLink> {
        let modelFqn: string | undefined,
            methodName: string | undefined,
            model: Model | undefined;

        if (value.includes('::')) {
            [modelFqn, methodName] = value.split('::');
        } else {
            const parentLine = YamlHelpers.getParentLine(this.document!, link.range.start.line);
            if (!parentLine) {
                return;
            }

            const root = YamlHelpers.getParent(this.document!, parentLine);
            if (root === 'scopes') {
                modelFqn = YamlHelpers.getSibling(this.document!, link.range.start, 'modelClass');

                if (!modelFqn) {
                    const controller = this.owner!.findEntityByRelatedName(this.document!.fileName);
                    if (controller instanceof Controller) {
                        const modelUqn = Str.singular(controller.uqn);
                        model = this.owner!.models.find(m => m.uqn === modelUqn);
                    }
                }
            } else if (root === 'fields') {
                model = (Store.instance.findOwner(this.document!.fileName) as BackendOwner)
                    ?.findEntityByRelatedName(this.document!.fileName) as Model;
            }

            methodName = value;
        }

        if (!(model instanceof Model)) {
            if (!modelFqn) {
                return;
            }

            if (modelFqn.startsWith('\\')) {
                modelFqn = modelFqn.slice(1);
            }

            model = this.project!.models.find(m => m.fqn === modelFqn);
        }

        if (!(model instanceof Model)) {
            vscode.window.showErrorMessage('Model not found');
            return;
        }

        const optionsMethod = model.phpClassMethods![methodName];
        if (!optionsMethod) {
            return;
        }

        const fragment = 'L'
            + optionsMethod.loc!.start.line
            + ','
            + (optionsMethod.loc!.start.column + 1);

        link.target = vscode.Uri.file(model.path)
            .with({ fragment });

        return link;
    }

    private resolveScopeLink(value: string, link: DocumentLink): vscode.ProviderResult<vscode.DocumentLink> {
        this.owner = Store.instance.findOwner(this.document!.fileName) as BackendOwner;
        if (!this.owner) {
            return;
        }

        const keyValuePair = YamlHelpers.getKeyAndValue(this.document!.lineAt(link.range.start.line).text);

        const isScope = keyValuePair.key === 'scope';
        const isSearchScope = keyValuePair.key === 'searchScope';
        const isModelScope = keyValuePair.key === 'modelScope';

        const config = yaml.parse(this.document!.getText());
        const rootKeys = Object.keys(config);
        const firstRootKey = rootKeys[0];

        const isFieldsConfig = ['fields', 'tabs', 'secondaryTabs'].includes(firstRootKey);
        const isFilterConfig = firstRootKey === 'scopes';
        const isListConfig = rootKeys.includes('list');

        let targetModel: Model | undefined;

        // fields.yaml, scope (type: relation, recordfinder)
        if (isScope && isFieldsConfig) {
            targetModel = this.getModelForFields(link.range.start);
        }

        // fields.yaml, searchScope (type: recordfinder)
        if (isSearchScope && isFieldsConfig) {
            targetModel = this.getModelForFields(link.range.start);
        }

        // config_filter.yaml, modelScope
        if (isModelScope && isFilterConfig) {
            targetModel = this.getModelForFilterConfig(link.range.start);
        }

        // config_filter.yaml, scope
        if (isScope && isFilterConfig) {
            targetModel = this.getModelForFilterConfig(link.range.start);
        }

        // config_list.yaml, scope
        if (isScope && isListConfig) {
            targetModel = this.getModelForListConfig(link.range.start);
        }

        if (!targetModel) {
            return;
        }

        const scopeMethod = targetModel.scopes[value];
        if (!scopeMethod) {
            return;
        }

        const fragment = 'L'
            + scopeMethod.loc!.start.line
            + ','
            + (scopeMethod.loc!.start.column + 1);

        link.target = vscode.Uri.file(targetModel.path)
            .with({ fragment });

        return link;
    }

    private resolveViewLink(value: string, link: DocumentLink): vscode.ProviderResult<vscode.DocumentLink> {
        const viewPath = resolveViewPath(this.project!, value);
        if (!viewPath) {
            vscode.window.showErrorMessage('View does not exists');
            return;
        }

        link.target = vscode.Uri.file(viewPath);

        return link;
    }

    private getModelForFields(position: vscode.Position): Model | undefined {
        const type = YamlHelpers.getSibling(this.document!, position, 'type');
        if (!type) {
            return;
        }

        if (type === 'relation') {
            const model = this.owner!.findEntityByRelatedName(this.document!.fileName);
            if (!(model instanceof Model)) {
                return;
            }

            const relationName = YamlHelpers.getParent(this.document!, position.line);
            if (!relationName) {
                return;
            }

            return model.relations[relationName];
        } else if (type === 'recordfinder') {
            let modelFqn = YamlHelpers.getSibling(this.document!, position, 'modelClass');
            if (!modelFqn) {
                return;
            }

            if (modelFqn.startsWith('\\')) {
                modelFqn = modelFqn.substring(1);
            }

            return this.project!.models.find(m => m.fqn === modelFqn);
        }
    }

    private getModelForFilterConfig(position: vscode.Position): Model | undefined {
        const controller = this.owner!.findEntityByRelatedName(this.document!.fileName);
        if (!(controller instanceof Controller)) {
            return;
        }

        const modelUqn = Str.singular(controller.uqn);
        return this.owner!.models.find(m => m.uqn === modelUqn);
    }

    private getModelForListConfig(position: vscode.Position): Model | undefined {
        const parent = YamlHelpers.getParent(this.document!, position.line);
        if (parent !== 'search') {
            return;
        }

        let modelFqn = yaml.parse(this.document!.getText())['modelClass'];
        if (modelFqn) {
            if (modelFqn.startsWith('\\')) {
                modelFqn = modelFqn.substring(1);
            }

            return this.owner!.models.find(m => m.fqn === modelFqn);
        }

        const controller = this.owner!.findEntityByRelatedName(this.document!.fileName);
        if (controller instanceof Controller) {
            const modelUqn = Str.singular(controller.uqn);
            return this.owner!.models.find(m => m.uqn === modelUqn);
        }
    }
}

type LinkMode = 'file' | 'view' | 'model' | 'options' | 'scope';

class DocumentLink extends _DocumentLInk {
    mode?: LinkMode;
}
