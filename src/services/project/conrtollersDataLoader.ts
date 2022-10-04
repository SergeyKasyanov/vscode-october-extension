import * as fs from "fs";
import * as phpParser from "php-parser";
import * as vscode from "vscode";
import * as yaml from 'yaml';
import { pluginsPath, rootPath } from "../../helpers/paths";
import { PluginFileUtils } from "../../helpers/pluginFileUtils";
import { BEHAVIORS } from "../../types/controllerBehaviors";
import { ConfigDefinition, Controller } from "../../types/plugin/controller";
import path = require("path");

export class ControllersDataLoader {
    private static _instance: ControllersDataLoader;

    static get instance(): ControllersDataLoader {
        if (!this._instance) {
            this._instance = new ControllersDataLoader;
        }

        return this._instance;
    }

    private updating: { [filename: string]: boolean } = {};

    private _controllers: {
        [pluginCode: string]: {
            [controller: string]: Controller
        }
    } = {};

    private constructor() {
        this.loadData();
        this.startWatcher();
    }

    public isControllerFile(filePath: string): boolean {
        let pathParts = filePath.replace(pluginsPath(), '').split(path.sep);
        if (pathParts[0] === '') {
            pathParts.shift();
        }

        return pathParts[2] === 'controllers';
    }

    public getControllerByFqn(fqn: string): Controller | undefined {
        let parts = fqn.toLowerCase().split('\\');
        if (parts[0] === '') {
            parts.shift();
        }

        const pluginCode = parts[0] + '.' + parts[1];
        const controllerName = parts[3];

        const pluginControllers = this._controllers[pluginCode];
        if (!pluginControllers) {
            return;
        }

        return pluginControllers[controllerName];
    }

    public getControllersByPlugin(pluginCode: string) {
        return this._controllers[pluginCode];
    }

    public getController(pluginCode: string, name: string) {
        const pluginControllers = this._controllers[pluginCode];

        for (const ctrl in pluginControllers) {
            if (Object.prototype.hasOwnProperty.call(pluginControllers, ctrl)) {
                const controller = pluginControllers[ctrl];
                if (controller.name.toLowerCase() === name.toLowerCase()) {
                    return controller;
                }
            }
        }
    }

    public refreshData() {
        try {
            this.loadData();
        } catch (err) {
            console.error(err);
        }
    }

    private loadData() {
        console.debug(this.constructor.name + ' loading...');

        fs.readdirSync(pluginsPath(), { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name)
            .forEach(vendor => fs.readdirSync(pluginsPath(vendor), { withFileTypes: true })
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name)
                .forEach(plugin => {
                    const controllersDir = pluginsPath(path.join(vendor, plugin, 'controllers'));

                    if (!fs.existsSync(controllersDir)) {
                        return;
                    }

                    fs.readdirSync(controllersDir, { withFileTypes: true })
                        .filter(entry => entry.isFile() && entry.name.endsWith('.php'))
                        .map(entry => entry.name)
                        .forEach(controller => {
                            const controllerFile = pluginsPath(path.join(vendor, plugin, 'controllers', controller));
                            this.loadController(controllerFile);
                        });
                }));

    }

    public async loadController(controllerFile: string, content?: string) {
        if (this.updating[controllerFile]) {
            return;
        }

        this.updating[controllerFile] = true;

        const controllerContent = content ? content : fs.readFileSync(controllerFile).toString();

        const engine = new phpParser.Engine({});
        const ast = engine.parseCode(controllerContent, controllerFile);
        const ns = ast.children.find(el => el.kind === 'namespace') as phpParser.Namespace;
        if (!ns) {
            this.updating[controllerFile] = false;
            return;
        }

        let behaviorsAliases: { [alias: string]: string } = {};

        ns.children.forEach(el => {
            if (el.kind === 'usegroup') {
                const items: phpParser.UseItem[] = (el as any).items;

                for (const useItem of items) {
                    let name = useItem.name;

                    if (!name.startsWith('\\')) {
                        name = '\\' + name;
                    }

                    if (!Object.keys(BEHAVIORS).includes(name)) {
                        continue;
                    }

                    if (useItem.alias) {
                        behaviorsAliases[useItem.alias.name] = name;
                    } else {
                        const alias = name.split('\\').pop();
                        behaviorsAliases[alias!] = name;
                    }
                }
                return;
            }
        });

        const controllerClass = ns.children.find(el => el.kind === 'class') as phpParser.Class;
        if (!controllerClass) {
            this.updating[controllerFile] = false;
            return;
        }

        let behaviors: {
            [name: string]: {
                [definition: string]: ConfigDefinition
            }
        } = {};

        let behaviorsConfigs: {
            [configName: string]: {
                [definition: string]: ConfigDefinition
            }
        } = {};

        const addBehavior = function (configName: string, definition: string, configPath: string) {
            if (behaviorsConfigs[configName] === undefined) {
                behaviorsConfigs[configName] = {};
            }

            behaviorsConfigs[configName][definition] = ControllersDataLoader.loadConfig(configPath, controllerFile);
        };

        const configPropsNames = Object.values(BEHAVIORS).map(el => el.property);

        controllerClass.body.forEach(el => {
            if (el.kind === 'propertystatement') {
                const classProperties = (el as unknown as phpParser.PropertyStatement).properties;
                for (const prop of classProperties) {
                    if (prop.kind === 'property') {
                        const propIdentifier = prop.name as phpParser.Identifier | string;
                        const propName = propIdentifier instanceof Object ? propIdentifier.name : propIdentifier;

                        if (propName === 'implement' && prop.value?.kind === 'array') {
                            (prop.value as phpParser.Array).items.forEach(entry => {
                                const entryValue = (entry as phpParser.Entry).value;

                                if (entryValue.kind === 'string') {
                                    const name = '\\' + (entryValue as phpParser.String).value.replace(/\./g, '\\');

                                    if (Object.keys(BEHAVIORS).includes(name)) {
                                        behaviors[name] = {};
                                    }
                                } else if (entryValue.kind === 'staticlookup') {
                                    const what = (entryValue as phpParser.StaticLookup).what;
                                    if (what?.kind !== 'name') {
                                        return;
                                    }

                                    const name = (what as phpParser.Name);
                                    const resolution = name.resolution;

                                    if (resolution === 'fqn') {
                                        behaviors[name.name] = {};
                                    } else if (resolution === 'uqn') {
                                        const beh = behaviorsAliases[name.name];
                                        if (!beh) {
                                            return;
                                        }

                                        behaviors[beh] = {};
                                    }
                                }
                            });
                        } else if (configPropsNames.includes(propName)) {
                            if (prop.value?.kind === 'array') {
                                (prop.value as phpParser.Array).items.forEach(item => {
                                    if ((item as phpParser.Entry).value?.kind !== 'string') {
                                        return;
                                    }

                                    const definition = ((item as phpParser.Entry).key as phpParser.String | phpParser.Number).value.toString();
                                    const configPath = ((item as phpParser.Entry).value as phpParser.String).value;

                                    addBehavior(propName, definition, configPath);
                                });
                            } else if (prop.value?.kind === 'string') {
                                const configPath = (prop.value as phpParser.String).value;

                                addBehavior(propName, 'default', configPath);
                            }
                        }
                    }
                }
            }
        });

        let behaviorsKey = Object.keys(behaviors);
        for (const beh of behaviorsKey) {
            const configPropName = BEHAVIORS[beh].property;

            if (Object.keys(behaviors).includes(beh)) {
                behaviors[beh] = behaviorsConfigs[configPropName];
            }
        }

        const parsed = PluginFileUtils.parseFileName(controllerFile);

        this._controllers[parsed!.pluginCode] = {};
        this._controllers[parsed!.pluginCode][parsed!.classNameWithoutExt] = new Controller(
            ns.name + '\\' + (controllerClass.name as phpParser.Identifier).name,
            behaviors
        );
    }

    private static loadConfig(configPath: string, controllerPath: string): ConfigDefinition {
        let realPath: string | undefined;

        if (configPath.startsWith('$')) {
            realPath = pluginsPath(configPath.slice(1).replace('/', path.sep));
            if (!fs.existsSync(realPath)) {
                return { path: configPath };
            }
        } else if (configPath.startsWith('~')) {
            realPath = rootPath(configPath.slice(1).replace('/', path.sep));
            if (!fs.existsSync(realPath)) {
                return { path: configPath };
            }
        } else {
            const controllerFileName = controllerPath.split(path.sep).reverse()[0];
            const controllerDir = controllerPath.replace(controllerFileName, '') + (controllerFileName.split('.')[0].toLowerCase());
            if (!fs.existsSync(controllerDir)) {
                return { path: configPath };
            }

            realPath = path.join(controllerDir, configPath);
            if (!fs.existsSync(realPath)) {
                return { path: configPath };
            }
        }

        const config = yaml.parse(fs.readFileSync(realPath).toString());

        return {
            path: configPath,
            realPath,
            config
        };
    }

    private startWatcher() {
        const pattern = new vscode.RelativePattern(pluginsPath(), ['**', 'models', '*.php'].join(path.sep));

        let watcher = vscode.workspace.createFileSystemWatcher(pattern);

        watcher.onDidCreate((e: vscode.Uri) => {
            console.debug('File created: ', e.path);

            this.loadController(e.path);
        });

        watcher.onDidChange((e: vscode.Uri) => {
            console.debug('File changed: ', e.path);

            this.updating[e.path] = false;
            this.loadController(e.path);
        });

        watcher.onDidDelete((e: vscode.Uri) => {
            console.debug('File deleted: ' + e.path);

            this.deleteController(e.path);
        });
    }

    private deleteController(controllerFile: string) {
        let pathParts = controllerFile.replace(pluginsPath(), '').split(path.sep);
        if (pathParts[0] === '') {
            pathParts.shift();
        }

        const pluginCode = pathParts[0] + '.' + pathParts[1];
        const modelName = pathParts[3].toLowerCase();

        delete this._controllers[pluginCode][modelName];
    }
}
