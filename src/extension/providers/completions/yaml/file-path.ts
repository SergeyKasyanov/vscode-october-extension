import * as vscode from "vscode";
import * as yaml from "yaml";
import { Model } from "../../../../domain/entities/classes/model";
import { OctoberClass } from "../../../../domain/entities/classes/october-class";
import { BackendOwner } from "../../../../domain/entities/owners/backend-owner";
import { Owner } from "../../../../domain/entities/owners/owner";
import { Project } from "../../../../domain/entities/project";
import { FsHelpers } from "../../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../../domain/helpers/path-helpers";
import { Store } from "../../../../domain/services/store";
import { getPathCompletions } from "../../../helpers/path-autocomplete";
import { YamlHelpers } from "../../../helpers/yaml-helpers";
import { awaitsCompletions } from "../../../helpers/awaits-completions";
import path = require("path");
import pluralize = require("pluralize");

const PATH_KEY = /\s*(path)\:\s*/g;
const PATH_KEY_PLUGIN = /\s*(path)\:\s*\$/;
const PATH_KEY_ROOT = /\s*(path)\:\s*\~/;

const CONFIG_KEY = /\s*(list|form|groups|filter)\:\s*/g;
const CONFIG_KEY_PLUGIN = /\s*(list|form|groups|filter)\:\s*\$/;
const CONFIG_KEY_ROOT = /\s*(list|form|groups|filter)\:\s*\~/;

const PATH_PART = /^[\$\~\w\\\/\-\_\.]*$/;
const PATH = /[\$\~\w\\\/\-\_\.]+/;

const TEMPLATE_NAME = /[\w\_\-\.\:]+/;

/**
 * Completions for path keys in yaml configs.
 *
 * path: partials/name
 * list: ~/plugins/me/blog/models/post/columns.yaml
 * groups: $/me/blog/models/post/body_groups.yaml
 * filter: list_filter.yaml
 */
export class FilePath implements vscode.CompletionItemProvider {

    private document?: vscode.TextDocument;
    private position?: vscode.Position;

    private project?: Project;
    private owner?: Owner;
    private entity?: OctoberClass;

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

        this.owner = this.project.findOwner(document.fileName);
        if (!this.owner) {
            return;
        }

        if (this.owner instanceof BackendOwner) {
            this.entity = this.owner.findEntityByRelatedName(document.fileName);
        }

        // TODO: add completions for toolbar buttons in config_list.yaml
        //
        // toolbar:
        //     buttons: ...

        if (this.awaitsPrefixedPartialPathCompletions(PATH_KEY_PLUGIN)) {
            return this.getPrefixedPartialPathCompletions(PathHelpers.pluginsPath(this.project!.path), '$', this.project!.platform!.backendViewExtensions);
        }

        if (this.awaitsPrefixedPartialPathCompletions(PATH_KEY_ROOT)) {
            return this.getPrefixedPartialPathCompletions(PathHelpers.rootPath(this.project!.path), '~', this.project!.platform!.backendViewExtensions);
        }

        if (this.entity instanceof Model && this.awaitsControllerPartialsPathCompletions()) {
            const partialsCompletions = this.getPathCompletions(this.project!.platform!.backendViewExtensions, true);
            const viewsCompletions = this.project!.views.map(tpl => {
                const item = new vscode.CompletionItem(tpl, vscode.CompletionItemKind.EnumMember);
                item.range = document.getWordRangeAtPosition(position, TEMPLATE_NAME);
                item.sortText = '1';

                return item;
            });

            let result: vscode.CompletionItem[] = [];

            if (partialsCompletions) {
                result = result.concat(partialsCompletions);
            }

            if (viewsCompletions) {
                result = result.concat(viewsCompletions);
            }

            return result;
        }

        if (this.awaitsPrefixedConfigPathCompletions(CONFIG_KEY_PLUGIN)) {
            return this.getPrefixedConfigPathCompletions(PathHelpers.pluginsPath(this.project.path), '$');
        }

        if (this.awaitsPrefixedConfigPathCompletions(CONFIG_KEY_ROOT)) {
            return this.getPrefixedConfigPathCompletions(PathHelpers.rootPath(this.project.path), '~');
        }

        if (this.entity instanceof Model && this.awaitsControllerConfigPathCompletions()) {
            return this.getControllerConfigPathCompletions();
        }
    }

    //
    // Partials
    //

    private awaitsPrefixedPartialPathCompletions(regexp: RegExp): boolean {
        const pathAttributeMatch = this.document!.lineAt(this.position!.line).text.match(regexp);
        if (!pathAttributeMatch) {
            return false;
        }

        return this.awaitsPartialsPathCompletions();
    }

    private awaitsControllerPartialsPathCompletions(): boolean {
        if (!awaitsCompletions(this.document!.getText(), this.document!.offsetAt(this.position!), PATH_KEY, PATH_PART)) {
            return false;
        }

        return this.awaitsPartialsPathCompletions();
    }

    private awaitsPartialsPathCompletions(): boolean {
        const elementType = YamlHelpers.getSameParentProperty(this.document!, this.position!, 'type');

        return !!elementType && ['partial', 'hint'].includes(elementType);
    }

    //
    // Configs
    //

    private awaitsPrefixedConfigPathCompletions(regexp: RegExp) {
        const pathAttributeMatch = this.document!.lineAt(this.position!.line).text.match(regexp);
        if (!pathAttributeMatch) {
            return;
        }

        return this.awaitsConfigPathCompletions();
    }

    private awaitsControllerConfigPathCompletions() {
        if (!awaitsCompletions(this.document!.getText(), this.document!.offsetAt(this.position!), CONFIG_KEY, PATH_PART)) {
            return;
        }

        return this.awaitsConfigPathCompletions();
    }

    private awaitsConfigPathCompletions() {
        const keyValue = YamlHelpers.getKeyAndValue(this.document!.lineAt(this.position!.line).text);

        if (keyValue.key === 'form') {
            // fields.yaml
            const fieldType = YamlHelpers.getSameParentProperty(this.document!, this.position!, 'type');
            if (fieldType && ['nestedform', 'repeater'].includes(fieldType)) {
                return true;
            }

            // config_relation.yaml
            const parent = YamlHelpers.getParent(this.document!, this.position!.line);
            if (parent && ['view', 'manage'].includes(parent)) {
                return true;
            }

            // config_form.yaml
            const thisConfig = yaml.parse(this.document!.getText());
            if (thisConfig['modelClass']) {
                return true;
            }
        }

        if (keyValue.key === 'list') {
            // fields.yaml
            const fieldType = YamlHelpers.getSameParentProperty(this.document!, this.position!, 'type');
            if (fieldType && 'recordfinder' === fieldType) {
                return true;
            }

            // config_import_export.yaml, config_relation.yaml
            const parent = YamlHelpers.getParent(this.document!, this.position!.line);
            if (parent && ['import', 'export', 'view', 'manage'].includes(parent)) {
                return true;
            }

            // config_list.yaml
            const thisConfig = yaml.parse(this.document!.getText());
            if (thisConfig['modelClass']) {
                return true;
            }
        }

        if (keyValue.key === 'filter') {
            // config_list.yaml
            const thisConfig = yaml.parse(this.document!.getText());
            if (thisConfig['modelClass']) {
                return true;
            }

            // config_relation.yaml
            const parent = YamlHelpers.getParent(this.document!, this.position!.line);
            if (parent && ['view', 'manage'].includes(parent)) {
                return true;
            }
        }

        if (keyValue.key === 'groups') {
            // fields.yaml
            const fieldType = YamlHelpers.getSameParentProperty(this.document!, this.position!, 'type');
            if (fieldType && 'repeater' === fieldType) {
                return true;
            }
        }

        return false;
    }

    private getControllerConfigPathCompletions(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        return this.getPathCompletions(['yaml']);
    }

    private getPrefixedConfigPathCompletions(rootDir: string, prefixSymbol: string) {
        return this.getPrefixedPartialPathCompletions(rootDir, prefixSymbol, ['yaml']);
    }

    //
    // Common
    //

    private getPrefixedPartialPathCompletions(rootDir: string, prefixSymbol: string, exts: string[]): vscode.CompletionItem[] | undefined {
        const keyValue = YamlHelpers.getKeyAndValue(this.document!.lineAt(this.position!.line).text);
        let entered = keyValue.value!.slice(1).replace('/', path.sep);

        const prefix = entered !== '' ? prefixSymbol : '';

        if (!entered.endsWith('/')) {
            entered += '/';
        }

        return getPathCompletions(rootDir, entered, exts, prefix)?.map(item => {
            item.range = this.document!.getWordRangeAtPosition(this.position!, PATH);
            return item;
        });
    }

    private getPathCompletions(exts: string[], isPartial: boolean = false): vscode.CompletionItem[] | undefined {
        if (!(this.entity instanceof Model)) {
            return;
        }

        const viewsDirName = pluralize.plural(this.entity.uqn.toLowerCase());
        const controllerViewsPath = path.join(this.owner!.path, 'controllers', viewsDirName);

        if (!FsHelpers.exists(controllerViewsPath)) {
            return;
        }

        return FsHelpers
            .listFiles(controllerViewsPath, true, exts)
            .map(file => {
                let fileParts = file.split(path.sep);
                if (fileParts[0] === '') {
                    fileParts.shift();
                }

                let name = fileParts.pop();
                if (!name) {
                    return;
                }

                if (isPartial) {
                    if (!name.startsWith('_')) {
                        return;
                    }

                    fileParts.push(name.slice(1, -4));
                } else {
                    fileParts.push(name);
                }

                return fileParts.join('/');
            })
            .filter(file => !!file)
            .map(file => {
                const item = new vscode.CompletionItem(file!, vscode.CompletionItemKind.File);
                item.range = this.document!.getWordRangeAtPosition(this.position!, PATH);
                item.sortText = '0';

                return item;
            });
    }
}
