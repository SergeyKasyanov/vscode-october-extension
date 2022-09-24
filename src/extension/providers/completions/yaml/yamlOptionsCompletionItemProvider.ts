import * as fs from "fs";
import { Class, Engine, Method, Namespace } from "php-parser";
import * as vscode from "vscode";
import * as yaml from 'yaml';
import { pluginsPath } from "../../../../helpers/paths";
import { regExps } from "../../../../helpers/regExps";
import { YamlFileUtils } from "../../../../helpers/yamlFileUtils";
import { isRightAfter } from "../../../helpers/isRightAfter";
import path = require("path");

export class YamlOptionsCompletionItemProvider implements vscode.CompletionItemProvider {

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

        if (!isRightAfter(document, position, regExps.yamlOptionsAttributeGlobal, regExps.spacesOrEmpty)) {
            return;
        }

        if (!document.fileName.startsWith(pluginsPath())) {
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
        const possible = [
            'selectable',
            'dropdown',
            'radio',
            'balloon-selector',
            'checkboxlist',
            'taglist',
        ];

        const fieldType = YamlFileUtils.getSameLevelPropertyValue(this.document!, this.position!, 'type');

        if (!fieldType || !possible.includes(fieldType)) {
            return;
        }

        let pathParts = this.document!.fileName.replace(pluginsPath(), '').split(path.sep);
        if (pathParts[0] === '') {
            pathParts.shift();
        }

        return this.getOptionsMethods(pathParts);
    }

    private getCompletionsForFilters(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const possible = [
            'group',
            'dropdown'
        ];

        const fieldType = YamlFileUtils.getSameLevelPropertyValue(this.document!, this.position!, 'type');

        if (!fieldType || !possible.includes(fieldType)) {
            return;
        }

        const modelClass = YamlFileUtils.getSameLevelPropertyValue(this.document!, this.position!, 'modelClass');
        if (!modelClass) {
            return;
        }

        let pathParts = modelClass.toLowerCase().split('\\');
        if (pathParts[0] === '') {
            pathParts.shift();
        }

        return this.getOptionsMethods(pathParts);
    }

    private getOptionsMethods(pathParts: string[]): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const modelsDir = [pathParts[0], pathParts[1], 'models'].join(path.sep);
        const loweredModel = pathParts[3];

        const candidates = fs
            .readdirSync(pluginsPath(modelsDir), { withFileTypes: true })
            .filter(entry => entry.isFile() && entry.name.toLowerCase().slice(0, -4) === loweredModel);

        if (candidates.length !== 1) {
            return;
        }

        const modelFileName = candidates[0].name;
        const modelPath = [pathParts[0], pathParts[1], 'models', modelFileName].join(path.sep);

        const modelCode = fs.readFileSync(pluginsPath(modelPath)).toString();
        const engine = new Engine({});
        const ast = engine.parseCode(modelCode, modelFileName);

        const ns = ast.children.find(el => el.kind === 'namespace') as Namespace;
        if (!ns) {
            return;
        }

        const modelClass = ns.children.find(el => el.kind === 'class') as Class;
        if (!modelClass) {
            return;
        }

        return modelClass.body
            .filter(child => {
                const isPublicMethod = child.kind === 'method'
                    && (child as Method).visibility === 'public';

                if (!isPublicMethod) {
                    return false;
                }

                child = child as Method;
                const name = child.name instanceof Object ? child.name.name : child.name;

                return name.startsWith('get') && name.endsWith('Options');
            })
            .map(method => new vscode.CompletionItem(
                method.name instanceof Object
                    ? method.name.name
                    : method.name,
                vscode.CompletionItemKind.Method,
            ));
    }
}
