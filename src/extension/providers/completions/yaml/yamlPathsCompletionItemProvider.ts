import path = require("path");
import pluralize = require("pluralize");
import * as fs from "fs";
import * as vscode from "vscode";
import * as yaml from "yaml";
import { getPathCompletions } from "../../../../helpers/pathAutocomplete";
import { pluginsPath, rootPath } from "../../../../helpers/paths";
import { readDirectoryRecursively } from "../../../../helpers/readDirectoryRecursively";
import { regExps } from "../../../../helpers/regExps";
import { YamlFileUtils } from "../../../../helpers/yamlFileUtils";
import { Platform } from "../../../../services/platform";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class YamlPathsCompletionItemProvider implements vscode.CompletionItemProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;

    private vendor: string | undefined;
    private plugin: string | undefined;
    private entity: string | undefined;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        let filePathParts = this.document!.fileName.replace(pluginsPath(), '').split(path.sep);
        if (filePathParts[0] === '') {
            filePathParts.shift();
        }

        if (!['models', 'controllers'].includes(filePathParts[2])) {
            return;
        }

        this.vendor = filePathParts[0];
        this.plugin = filePathParts[1];
        this.entity = filePathParts[3];

        if (this.awaitsPrefixedPartialPathCompletions(regExps.yamlPartialPathAttributePlugin)) {
            return this.getPrefixedPartialPathCompletions(pluginsPath(), '$');
        }

        if (this.awaitsPrefixedPartialPathCompletions(regExps.yamlPartialPathAttributeRoot)) {
            return this.getPrefixedPartialPathCompletions(rootPath(), '~');
        }

        if (this.awaitsControllerPartialsPathCompletions()) {
            return this.getControllerPartialsPathCompletions();
        }

        if (this.awaitsPrefixedConfigPathCompletions(regExps.yamlConfigPathAttributePlugin)) {
            return this.getPrefixedConfigPathCompletions(pluginsPath(), '$');
        }

        if (this.awaitsPrefixedConfigPathCompletions(regExps.yamlConfigPathAttributeRoot)) {
            return this.getPrefixedConfigPathCompletions(rootPath(), '~');
        }

        if (this.awaitsControllerConfigPathCompletions()) {
            return this.getControllerConfigPathCompletions();
        }
    }

    //
    // Partials
    //

    private awaitsPrefixedPartialPathCompletions(regexp: RegExp) {
        const pathAttributeMatch = this.document!.lineAt(this.position!.line).text.match(regexp);
        if (!pathAttributeMatch) {
            return;
        }

        return this.awaitsPartialsPathCompletions();
    }

    private awaitsControllerPartialsPathCompletions() {
        if (!isRightAfter(this.document!, this.position!, regExps.yamlPartialPathAttributeGlobal, regExps.spaces)) {
            return;
        }

        return this.awaitsPartialsPathCompletions();
    }

    private awaitsPartialsPathCompletions() {
        const elementType = YamlFileUtils.getSameLevelPropertyValue(this.document!, this.position!, 'type');

        return elementType && ['partial', 'hint'].includes(elementType);
    }

    private getControllerPartialsPathCompletions(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        return this.getPathCompletions(Platform.getInstance().getBackendViewExtensions(), true);
    }

    private getPrefixedPartialPathCompletions(rootDir: string, prefixSymbol: string) {
        return this.getPrefixedPathCompletions(rootDir, prefixSymbol, Platform.getInstance().getBackendViewExtensions());
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
        if (!isRightAfter(this.document!, this.position!, regExps.yamlConfigPathAttributeGlobal, regExps.spaces)) {
            return;
        }

        return this.awaitsConfigPathCompletions();
    }

    private awaitsConfigPathCompletions() {
        const keyValue = YamlFileUtils.getKeyAndValue(this.document!, this.position!.line);

        if (keyValue.key === 'form') {
            // fields.yaml
            const fieldType = YamlFileUtils.getSameLevelPropertyValue(this.document!, this.position!, 'type');
            if (fieldType && ['nestedform', 'repeater'].includes(fieldType)) {
                return true;
            }

            // config_relation.yaml
            const parent = YamlFileUtils.getParent(this.document!, this.position!.line);
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
            const fieldType = YamlFileUtils.getSameLevelPropertyValue(this.document!, this.position!, 'type');
            if (fieldType && 'recordfinder' === fieldType) {
                return true;
            }

            // config_import_export.yaml, config_relation.yaml
            const parent = YamlFileUtils.getParent(this.document!, this.position!.line);
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
            const parent = YamlFileUtils.getParent(this.document!, this.position!.line);
            if (parent && ['view', 'manage'].includes(parent)) {
                return true;
            }
        }

        if (keyValue.key === 'groups') {
            // fields.yaml
            const fieldType = YamlFileUtils.getSameLevelPropertyValue(this.document!, this.position!, 'type');
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
        return this.getPrefixedPathCompletions(rootDir, prefixSymbol, ['yaml']);
    }

    //
    // Common
    //

    private getPrefixedPathCompletions(rootDir: string, prefixSymbol: string, exts: string[]) {
        const keyValue = YamlFileUtils.getKeyAndValue(this.document!, this.position!.line);
        let entered = keyValue.value!.slice(1).replace('/', path.sep);

        const prefix = entered !== '' ? prefixSymbol : '';

        if (!entered.endsWith('/')) {
            entered += '/';
        }

        return getPathCompletions(rootDir, entered, exts, prefix);
    }

    private getPathCompletions(exts: string[], isPartial: boolean = false) {
        const controllerName = pluralize.plural(this.entity!);
        const controllerViewsPath = pluginsPath(path.join(this.vendor!, this.plugin!, 'controllers', controllerName));

        if (!fs.existsSync(controllerViewsPath)) {
            return;
        }

        return readDirectoryRecursively({ dir: controllerViewsPath, exts })
            .map(function (file) {
                let fileParts = file.split(path.sep);
                if (fileParts[0] === '') {
                    fileParts.shift();
                }

                let name = fileParts.pop();
                if (!name) {
                    return undefined;
                }

                if (isPartial) {
                    if (!name.startsWith('_')) {
                        return undefined;
                    }

                    fileParts.push(name.slice(1, -4));
                } else {
                    fileParts.push(name);
                }

                return fileParts.join('/');
            })
            .filter(file => !!file)
            .map(file => new vscode.CompletionItem(file!, vscode.CompletionItemKind.File));
    }
}
