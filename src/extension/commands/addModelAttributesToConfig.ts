import * as fs from 'fs';
import * as phpParser from 'php-parser';
import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { getClassFilePath } from '../../helpers/getClassFilePath';
import { getPropertiesFromDockBlock, parsePhp } from '../../helpers/parsePhp';
import { PluginFileUtils } from '../../helpers/pluginFileUtils';
import { ucFirst } from '../../helpers/str';
import { Project } from '../../services/project';
import { Model } from '../../types/plugin/model';

export class FillFieldsYaml {

    private editor: vscode.TextEditor | undefined;
    private model: Model | undefined;
    private attributes: string[] = [];
    private yamlConfig: any;
    private chosen: string[] | undefined;
    private configChanged: boolean = false;

    public async execute() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.document || !editor.document.fileName.endsWith('yaml')) {
            return;
        }

        this.editor = editor;

        const parsedPath = PluginFileUtils.parseFileName(editor.document.fileName);
        if (!parsedPath || parsedPath.directory !== 'models') {
            vscode.window.showErrorMessage('This command available only for fields.yaml or columns.yaml');
            return;
        }

        this.model = Project.instance.getModel(parsedPath.pluginCode, parsedPath.classNameWithoutExt);
        if (!this.model) {
            vscode.window.showErrorMessage('This command available only for fields.yaml or columns.yaml');
            return;
        }

        this.loadAttributes();

        if (this.attributes.length === 0) {
            vscode.window.showErrorMessage('Model ' + parsedPath.classNameWithoutExt + ' does not have attributes');
            return;
        }

        this.yamlConfig = yaml.parse(this.editor!.document.getText());

        this.removeAlreadyAdded();

        if (this.attributes.length === 0) {
            vscode.window.showInformationMessage('All columns already added');
            return;
        }

        this.chosen = await vscode.window.showQuickPick(this.attributes, {
            canPickMany: true,
            title: 'Choose model attributes for add to config'
        });
        if (this.chosen === undefined) {
            return;
        }

        this.changeYamlConfig();

        if (!this.configChanged) {
            return;
        }

        const toWrite = yaml.stringify(this.yamlConfig, { indent: 4 });

        editor.edit(builder => {
            builder.replace(
                new vscode.Range(
                    new vscode.Position(0, 0),
                    new vscode.Position(editor.document.lineCount, editor.document.lineAt(editor.document.lineCount - 1).text.length)
                ),
                toWrite
            );
        });
    }

    private loadAttributes() {
        let attributes: string[] = [];

        for (const colName in this.model!.columns) {
            if (Object.prototype.hasOwnProperty.call(this.model!.columns, colName)) {
                const col = this.model!.columns[colName];
                attributes.push(col.name);
            }
        }

        attributes.push(...this.getDocBlockAttributes());
        attributes = [...new Set(attributes)].sort();

        this.attributes = attributes;
    }

    private getDocBlockAttributes(): string[] {
        const modelPath = getClassFilePath(this.model!.fqn);
        if (!modelPath || !fs.existsSync(modelPath)) {
            return [];
        }

        const modelCode = fs.readFileSync(modelPath).toString();
        const ast = parsePhp(modelCode, this.model!.name);
        const ns = ast.children.find(el => el.kind === 'namespace') as phpParser.Namespace;
        if (!ns) {
            return [];
        }

        const modelClass = ns.children.find(el => el.kind === 'class') as phpParser.Class;
        if (!modelClass) {
            return [];
        }

        if (!modelClass.leadingComments || modelClass.leadingComments.length === 0) {
            return [];
        }

        let attributes: string[] = [];

        modelClass.leadingComments.forEach(comment => {
            const properties = getPropertiesFromDockBlock(comment);
            attributes.push(...properties);
        });

        return attributes;
    }

    private removeAlreadyAdded() {
        let alreadyAdded = [];

        if (this.yamlConfig!.columns) {
            alreadyAdded.push(...Object.keys(this.yamlConfig!.columns));
        } else if (this.yamlConfig!.fields) {
            alreadyAdded.push(...Object.keys(this.yamlConfig!.fields));

            if (this.yamlConfig!.tabs && this.yamlConfig!.tabs.fields) {
                alreadyAdded.push(...Object.keys(this.yamlConfig!.tabs.fields));
            }

            if (this.yamlConfig!.secondaryTabs && this.yamlConfig!.secondaryTabs.fields) {
                alreadyAdded.push(...Object.keys(this.yamlConfig!.secondaryTabs.fields));
            }
        } else {
            vscode.window.showErrorMessage('Config must contain "fields:" or "columns:" root tag');
            return;
        }

        let leftAttributes = [];

        for (let index = 0; index < this.attributes.length; index++) {
            const attr = this.attributes[index];
            if (!alreadyAdded.includes(attr)) {
                leftAttributes.push(attr);
            }
        }

        this.attributes = leftAttributes;
    }

    private changeYamlConfig() {
        let toAdd: string[] = [];

        for (const attr of this.attributes) {
            if (this.chosen!.includes(attr)) {
                toAdd.push(attr);
            }
        }

        if (toAdd.length === 0) {
            return;
        }

        let key;

        if (this.yamlConfig.columns) {
            key = 'columns';
        } else if (this.yamlConfig.fields) {
            key = 'fields';
        } else {
            return;
        }

        for (const attr of toAdd) {
            this.yamlConfig[key][attr] = {
                label: attr.split('_').map(word => ucFirst(word)).join(' ')
            };
            this.configChanged = true;
        }
    }
}
