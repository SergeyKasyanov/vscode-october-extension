import * as fs from "fs";
import { pluginsPath } from "../helpers/paths";
import { Component } from "../types/plugin/component";
import { ConfigKey } from "../types/configKey";
import { Permission } from "../types/plugin/permission";
import { Plugin } from "../types/plugin/plugin";
import { TwigFilter } from "../types/twig/twigFilter";
import { TwigFunction } from "../types/twig/twigFunction";
import { TwigTag } from "../types/twig/twigTag";
import { ComponentsDataLoader } from "./project/componentsDataLoader";
import { ConfigDataLoader } from "./project/configDataLoader";
import { PermissionsDataLoader } from "./project/permissionsDataLoader";
import { PluginsDataLoader } from "./project/pluginsDataLoader";
import { TwigFiltersDataLoader } from "./project/twigFiltersDataLoader";
import { TwigFunctionsDataLoader } from "./project/twigFunctionsDataLoader";
import { TwigTagsDataLoader } from "./project/twigTagsDataLoader";
import { TwigTestsDataLoader } from "./project/twigTestsDataLoader";
import path = require("path");
import { getFqn } from "../helpers/getFqn";
import { ModelsDataLoader } from "./project/modelsDataLoader";
import { Model, Relation } from "../types/plugin/model";
import { MailTemplatesDataLoader } from "./project/mailTemplatesDataLoader";
import { EnvDataLoader } from "./project/envDataLoader";

export class Project {

    private static _instance: Project;

    public static get instance(): Project {
        if (!this._instance) {
            this._instance = new Project();
        }

        return this._instance;
    }

    private pluginsLoader: PluginsDataLoader;
    private componentsLoader: ComponentsDataLoader;
    private modelsLoader: ModelsDataLoader;
    private permissionsLoader: PermissionsDataLoader;
    private envLoader: EnvDataLoader;
    private configLoader: ConfigDataLoader;
    private mailTemplatesLoader: MailTemplatesDataLoader;
    private twigTagsLoader: TwigTagsDataLoader;
    private twigFunctionsLoader: TwigFunctionsDataLoader;
    private twigFiltersLoader: TwigFiltersDataLoader;
    private twigTestsLoader: TwigTestsDataLoader;

    private constructor() {
        this.pluginsLoader = PluginsDataLoader.getInstance();
        this.componentsLoader = ComponentsDataLoader.getInstance();
        this.modelsLoader = ModelsDataLoader.instance;
        this.permissionsLoader = PermissionsDataLoader.getInstance();
        this.envLoader = EnvDataLoader.instance;
        this.configLoader = ConfigDataLoader.getInstance();
        this.mailTemplatesLoader = MailTemplatesDataLoader.instance;
        this.twigTagsLoader = TwigTagsDataLoader.getInstance();
        this.twigFunctionsLoader = TwigFunctionsDataLoader.getInstance();
        this.twigFiltersLoader = TwigFiltersDataLoader.getInstance();
        this.twigTestsLoader = TwigTestsDataLoader.getInstance();
    }

    public refreshData() {
        this.pluginsLoader.refreshData();
        this.componentsLoader.refreshData();
        this.modelsLoader.refreshData();
        this.permissionsLoader.refreshData();
        this.envLoader.refreshData();
        this.configLoader.refreshData();
        this.mailTemplatesLoader.refreshData();
        this.twigTagsLoader.refreshData();
        this.twigFunctionsLoader.refreshData();
        this.twigFiltersLoader.refreshData();
        this.twigTestsLoader.refreshData();
    }

    // Plugins

    public getPlugins(): { [code: string]: Plugin } {
        return this.pluginsLoader.data;
    }

    public getPlugin(code: string): Plugin | undefined {
        for (const plCode in this.pluginsLoader.data) {
            if (Object.prototype.hasOwnProperty.call(this.pluginsLoader.data, plCode)) {
                const plugin = this.pluginsLoader.data[plCode];
                if (plCode.toLowerCase() === code.toLowerCase()) {
                    return plugin;
                }
            }
        }
    }

    public isPluginExists(code: string) {
        return Object.keys(this.pluginsLoader.data).includes(code);
    }

    public getControllersByPlugin(code: string, fqn: boolean = false): string[] {
        let author, plugin;
        [author, plugin] = Plugin.splitCode(code);

        let controllers: string[] = [];

        const controllersDir = (author + path.sep + plugin + path.sep + 'controllers').toLowerCase();
        const controllersPath = pluginsPath(controllersDir);

        if (!fs.existsSync(controllersPath)) {
            return controllers;
        }

        const phpFiles = fs
            .readdirSync(controllersPath, { withFileTypes: true })
            .filter(entry => entry.isFile() && entry.name.endsWith('.php'));

        for (const file of phpFiles) {
            const controller = fqn
                ? getFqn(controllersPath + path.sep + file.name)
                : file.name.replace('.php', '');

            if (controller) {
                controllers.push(controller);
            }
        }

        return controllers;
    }

    // Mail templates

    public getMailTemplates() {
        return this.mailTemplatesLoader.templates;
    }

    // Models

    public getModelsNamesByPlugin(code: string) {
        let names = [];

        const models = this.modelsLoader.getModelsByPlugin(code);
        for (const m in models) {
            if (Object.prototype.hasOwnProperty.call(models, m)) {
                const model = models[m];
                names.push(model.name);
            }
        }

        return names;
    }

    public getModelsFqnByPlugin(code: string) {
        let fqn = [];

        const models = this.modelsLoader.getModelsByPlugin(code);
        for (const m in models) {
            if (Object.prototype.hasOwnProperty.call(models, m)) {
                const model = models[m];
                fqn.push(model.fqn);
            }
        }

        return fqn;
    }

    public getModelRelations(pluginCode: string, modelName: string): { [name: string]: Relation } | undefined {
        const pluginModels = this.modelsLoader.getModelsByPlugin(pluginCode);
        if (!pluginModels) {
            return;
        }

        const model = pluginModels[modelName];
        if (!model) {
            return;
        }

        return model.relations;
    }

    public getModel(pluginCode: string, modelName: string): Model | undefined {
        const pluginModels = this.modelsLoader.getModelsByPlugin(pluginCode);
        if (!pluginModels) {
            return;
        }

        return pluginModels[modelName.toLowerCase()];
    }

    public getModelByFqn(fqn: string) {
        return this.modelsLoader.getModelByFqn(fqn);
    }

    public getModelRelation(pluginCode: string, modelName: string, relationName: string): Relation | undefined {
        const relations = this.getModelRelations(pluginCode, modelName);
        if (!relations) {
            return;
        }

        return relations[relationName];
    }

    // Components

    public getComponents(): { [name: string]: Component } {
        return this.componentsLoader.data;
    }

    public getComponent(name: string): Component | undefined {
        return this.componentsLoader.data[name];
    }

    public getComponentByFqn(fqn: string): Component | undefined {
        if (fqn.startsWith('\\')) {
            fqn = fqn.slice(1);
        }
        for (const c in this.componentsLoader.data) {
            if (Object.prototype.hasOwnProperty.call(this.componentsLoader.data, c)) {
                const comp = this.componentsLoader.data[c] as Component;
                if (comp.data.className === fqn) {
                    return comp;
                }
            }
        }
    }

    // Permissions

    public getPermissions(): { [code: string]: Permission } {
        return this.permissionsLoader.data;
    }

    public getPermission(code: string): Permission | undefined {
        return this.permissionsLoader.data[code];
    }

    // Config

    public getConfigs(): { [code: string]: ConfigKey } {
        return this.configLoader.data;
    }

    // Env

    public getEnvKeys(): string[] {
        return this.envLoader.envKeys;
    }

    // Twig tags

    public getTags(): { [name: string]: TwigTag } {
        return this.twigTagsLoader.data;
    }

    public getTag(name: string): TwigTag | undefined {
        return this.twigTagsLoader.data[name];
    }

    // Twig functions

    public getTwigFunctions(): { [code: string]: TwigFunction } {
        return this.twigFunctionsLoader.data;
    }

    public getTwigFunction(name: string): TwigFunction | undefined {
        return this.twigFunctionsLoader.data[name];
    }

    // Twig filters

    public getTwigFilters(): { [code: string]: TwigFilter } {
        return this.twigFiltersLoader.data;
    }

    public getTwigFilter(name: string): TwigFilter | undefined {
        return this.twigFiltersLoader.data[name];
    }

    // Twig tests

    public getTwigTests(): { [code: string]: TwigFilter } {
        return this.twigTestsLoader.data;
    }

    public getTwigTest(name: string): TwigFilter | undefined {
        return this.twigTestsLoader.data[name];
    }

}
