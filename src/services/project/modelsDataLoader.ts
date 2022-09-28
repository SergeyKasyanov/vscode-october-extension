import * as fs from "fs";
import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { pluginsPath } from "../../helpers/paths";
import { execPhpInProject } from "../../helpers/shell";
import { lcFirst } from "../../helpers/str";
import { Model } from "../../types/plugin/model";
import getColumnsPhpCode from "./php/modelColumnsLoaderCode";
import getRelationPhpCode from "./php/relationsLoadCode";
import path = require("path");

export class ModelsDataLoader {
    private static _instance: ModelsDataLoader;

    public static get instance(): ModelsDataLoader {
        if (!this._instance) {
            this._instance = new ModelsDataLoader();
        }

        return this._instance;
    }

    private updating: { [filename: string]: boolean } = {};

    private _models: {
        [pluginCode: string]: {
            [model: string]: Model
        }
    } = {};

    private constructor() {
        this.loadData();
        this.startWatcher();
    }

    public isModelFile(filePath: string): boolean {
        let pathParts = filePath.replace(pluginsPath(), '').split(path.sep);
        if (pathParts[0] === '') {
            pathParts.shift();
        }

        return pathParts[2] === 'models';
    }

    public getModelsByPlugin(pluginCode: string): { [model: string]: Model; } {
        return this._models[pluginCode.toLowerCase()];
    }

    public getModelsNamesByPlugin(pluginCode: string) {
        const pluginModels = this._models[pluginCode];
        if (!pluginModels) {
            return;
        }

        return Object.keys(pluginModels);
    }

    public getModelsByTable(table: string): Model[] {
        let models = [];

        for (const code in this._models) {
            if (Object.prototype.hasOwnProperty.call(this._models, code)) {
                const pluginModels = this._models[code];
                for (const name in pluginModels) {
                    if (Object.prototype.hasOwnProperty.call(pluginModels, name)) {
                        const model = pluginModels[name];
                        if (model.table === table) {
                            models.push(model);
                        }
                    }
                }
            }
        }

        return models;
    }

    public getModelByFqn(fqn: string): Model | undefined {
        let parts = fqn.toLowerCase().split('\\');
        if (parts[0] === '') {
            parts.shift();
        }

        const pluginCode = parts[0] + '.' + parts[1];
        const modelName = parts[3];

        const pluginModels = this._models[pluginCode];
        if (!pluginModels) {
            return;
        }

        return pluginModels[modelName];
    }

    public refreshData() {
        this.loadData();
    }

    private loadData() {
        fs.readdirSync(pluginsPath(), { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name)
            .forEach(vendor => fs.readdirSync(pluginsPath(vendor), { withFileTypes: true })
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name)
                .forEach(plugin => {
                    const modelsDir = pluginsPath([vendor, plugin, 'models'].join(path.sep));

                    if (!fs.existsSync(modelsDir)) {
                        return;
                    }

                    fs.readdirSync(modelsDir, { withFileTypes: true })
                        .filter(entry => entry.isFile() && entry.name.endsWith('.php'))
                        .map(entry => entry.name)
                        .forEach(model => {
                            const modelFile = pluginsPath([vendor, plugin, 'models', model].join(path.sep));
                            this.loadModel(modelFile);
                        });
                }));
    }

    public async loadModel(modelFile: string, content?: string) {
        if (this.updating[modelFile]) {
            return;
        }

        this.updating[modelFile] = true;

        const modelContent = content ? content : fs.readFileSync(modelFile).toString();

        const engine = new phpParser.Engine({});
        const ast = engine.parseCode(modelContent, modelFile);
        const ns = ast.children.find(el => el.kind === 'namespace') as phpParser.Namespace;
        if (!ns) {
            this.updating[modelFile] = false;
            return;
        }

        const modelClass = ns.children.find(el => el.kind === 'class') as phpParser.Class;
        if (!modelClass) {
            this.updating[modelFile] = false;
            return;
        }

        let optionsMethods: string[] = [];
        let scopes: string[] = [];
        let table: string | undefined = undefined;

        modelClass.body
            .filter(child => child.kind === 'method' && (child as phpParser.Method).visibility === 'public')
            .forEach(method => {
                method = method as phpParser.Method;
                const name = method.name instanceof Object ? method.name.name : method.name;

                if (name.startsWith('get') && name.endsWith('Options')) {
                    optionsMethods.push(name);
                }

                if (name.startsWith('scope')) {
                    const scopeName = lcFirst(name.slice(5));

                    scopes.push(scopeName);
                }
            });

        modelClass.body
            .forEach(el => {
                if (el.kind === 'propertystatement') {
                    const classProperties = (el as unknown as phpParser.PropertyStatement).properties;
                    for (const prop of classProperties) {
                        if (prop.kind === 'property') {
                            const propIdentifier = prop.name as phpParser.Identifier | string;
                            const propName = propIdentifier instanceof Object ? propIdentifier.name : propIdentifier;

                            if (propName === 'table') {
                                table = (prop.value as phpParser.String).value;
                            }
                        }
                    }
                }
            });

        let pathParts = modelFile.replace(pluginsPath(), '').split(path.sep);
        if (pathParts[0] === '') {
            pathParts.shift();
        }

        const pluginCode = pathParts[0] + '.' + pathParts[1];
        const modelName = pathParts[3].toLowerCase().slice(0, -4);
        const modelFqn = '\\' + ns.name + '\\' + (modelClass.name instanceof Object ? modelClass.name.name : modelClass.name);

        let relations = {};
        try {
            const rawData = await execPhpInProject(getRelationPhpCode(modelFqn.replace(/\\\\/, '\\\\\\\\')));
            relations = JSON.parse(rawData);
        } catch (err) {
            console.debug(err);
            relations = {};
        }

        let columns = {};
        try {
            const rawData = await execPhpInProject(getColumnsPhpCode(modelFqn.replace(/\\\\/, '\\\\\\\\')));
            columns = JSON.parse(rawData);
        } catch (err) {
            console.debug(err);
            columns = {};
        }

        if (!this._models[pluginCode]) {
            this._models[pluginCode] = {};
        }

        this._models[pluginCode][modelName] = new Model(modelFqn, scopes, optionsMethods, relations, columns, table);

        this.updating[modelFile] = false;
    }

    private startWatcher() {
        const pattern = new vscode.RelativePattern(pluginsPath(), ['**', 'models', '*.php'].join(path.sep));

        let watcher = vscode.workspace.createFileSystemWatcher(pattern);

        watcher.onDidCreate((e: vscode.Uri) => {
            console.debug('File created: ', e.path);

            this.loadModel(e.path);
        });

        watcher.onDidChange((e: vscode.Uri) => {
            console.debug('File changed: ', e.path);

            this.updating[e.path] = false;
            this.loadModel(e.path);
        });

        watcher.onDidDelete((e: vscode.Uri) => {
            console.debug('File deleted: ' + e.path);

            this.deleteModel(e.path);
        });
    }

    private deleteModel(modelFile: string) {
        let pathParts = modelFile.replace(pluginsPath(), '').split(path.sep);
        if (pathParts[0] === '') {
            pathParts.shift();
        }

        const pluginCode = pathParts[0] + '.' + pathParts[1];
        const modelName = pathParts[3].toLowerCase();

        delete this._models[pluginCode][modelName];
    }
}
