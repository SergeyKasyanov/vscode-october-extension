import { Config } from "../../config";
import { TwigFiltersList } from "../static/twig-filters";
import { TwigFunctionsList } from "../static/twig-functions";
import { ControllerBehavior, ModelBehavior } from "./classes/behavior";
import { Command } from "./classes/command";
import { Component } from "./classes/component";
import { Controller } from './classes/controller';
import { Migration } from './classes/migration';
import { Model } from "./classes/model";
import { getConfig } from './concerns/project-config';
import { EnvKeysCollection, getEnv } from "./concerns/project-env";
import { getEvents } from "./concerns/project-events";
import { Translations, getTranslations } from './concerns/project-lang';
import { getLocale } from "./concerns/project-locale";
import { AppDirectory } from "./owners/app-directory";
import { Module } from "./owners/module";
import { Owner } from './owners/owner';
import { Plugin } from "./owners/plugin";
import { Theme } from "./owners/theme";
import { Platform } from "./platform";
import { Permission } from "./types";
import path = require("path");

/**
 * Represents opened project
 */
export class Project {
    platform?: Platform;
    appDir?: AppDirectory;
    modules: Module[] = [];
    plugins: Plugin[] = [];
    themes: Theme[] = [];

    constructor(
        private _path: string,
    ) { }

    /**
     * Path to project
     */
    get path(): string {
        return this._path;
    }

    /**
     * List of keys from .env file
     */
    get envVariables(): EnvKeysCollection {
        return getEnv(this);
    }

    /**
     * All config entries of project
     */
    get config(): string[] {
        return getConfig(this);
    }

    /**
     * Detect locale of project
     */
    get locale(): string {
        return getLocale(this);
    }

    /**
     * Get translation strings
     */
    get translations(): Translations {
        return getTranslations(this);
    }

    /**
     * List global events of project
     */
    get events():string[] {
        return getEvents(this);
    }

    /**
     * All context owners of project
     */
    get contextOwners(): string[] {
        return [
            ...(this.appDir?.contextOwner ? [this.appDir?.contextOwner] : []),
            ...this.plugins.flatMap(owner => owner.contextOwner),
            ...this.modules.flatMap(owner => owner.contextOwner),
        ];
    }

    /**
     * All artisan commands of project
     */
    get commands(): Command[] {
        return [
            ...(this.appDir?.commands || []),
            ...this.plugins.flatMap(owner => owner.commands),
            ...this.modules.flatMap(owner => owner.commands),
        ];
    }

    /**
     * All controller behaviors of project
     */
    get controllerBehaviors(): ControllerBehavior[] {
        return [
            ...(this.appDir?.controllerBehaviors || []),
            ...this.plugins.flatMap(owner => owner.controllerBehaviors),
            ...this.modules.flatMap(owner => owner.controllerBehaviors),
        ];
    }

    /**
     * All components from project
     */
    get components(): Component[] {
        return [
            ...(this.appDir?.components || []),
            ...this.plugins.flatMap(owner => owner.components),
            ...this.modules.flatMap(owner => owner.components),
        ];
    }

    /**
     * All controllers from project
     */
    get controllers(): Controller[] {
        return [
            ...(this.appDir?.controllers || []),
            ...this.plugins.flatMap(owner => owner.controllers),
            ...this.modules.flatMap(owner => owner.controllers),
        ];
    }

    /**
     * All model behaviors of project
     */
    get modelBehaviors(): ModelBehavior[] {
        return [
            ...(this.appDir?.modelBehaviors || []),
            ...this.plugins.flatMap(owner => owner.modelBehaviors),
            ...this.modules.flatMap(owner => owner.modelBehaviors),
        ];
    }

    /**
     * All migrations registered in project
     */
    get migrations(): Migration[] {
        return [
            ...(this.appDir?.migrations || []),
            ...this.plugins.flatMap(owner => owner.migrations),
            ...this.modules.flatMap(owner => owner.migrations),
        ];
    }

    /**
     * All models of project
     */
    get models(): Model[] {
        return [
            ...(this.appDir?.models || []),
            ...this.plugins.flatMap(owner => owner.models),
            ...this.modules.flatMap(owner => owner.models),
        ];
    }

    /**
     * All permissions defined in project
     */
    get permissions(): Permission[] {
        return [
            ...(this.appDir?.permissions || []),
            ...this.plugins.flatMap(owner => owner.permissions),
            ...this.modules.flatMap(owner => owner.permissions),
        ];
    }

    /**
     * All views registered in project
     */
    get views(): string[] {
        return [
            ...(this.appDir?.views || []),
            ...this.plugins.flatMap(owner => owner.views),
            ...this.modules.flatMap(owner => owner.views),
        ];
    }

    /**
     * All twig functions registered in app and plugins
     */
    get twigFunctions(): TwigFunctionsList {
        let functionsList: TwigFunctionsList = {};

        const owners: (Plugin | AppDirectory)[] = this.plugins;
        if (this.appDir) {
            owners.push(this.appDir);
        }

        for (const owner of owners) {
            const ownerTwigFunctions = owner.twigFunctions;

            functionsList = {
                ...functionsList,
                ...ownerTwigFunctions
            };
        }

        return functionsList;
    }

    /**
     * All twig filters registered in app and plugins
     */
    get twigFilters(): TwigFiltersList {
        let filtersList: TwigFiltersList = {};

        const owners: (Plugin | AppDirectory)[] = this.plugins;
        if (this.appDir) {
            owners.push(this.appDir);
        }

        for (const owner of owners) {
            const ownerTwigFilters = owner.twigFilters;

            filtersList = {
                ...filtersList,
                ...ownerTwigFilters
            };
        }

        return filtersList;
    }

    /**
     * Backend pages urls
     */
    get backendUrls(): string[] {
        const urls: string[] = [];

        this.controllers.forEach(controller => {
            let url = controller.owner.name.replace('.', '/');
            if (controller.uqn !== 'Index') {
                url += '/' + controller.uqn.toLowerCase();
            }

            const addUrl = function (pageMethod: string) {
                if (pageMethod === 'index') {
                    if (!urls.includes(url + '/' + pageMethod)) {
                        urls.push(url + '/' + pageMethod);
                    }

                    if (!urls.includes(url)) {
                        urls.push(url);
                    }
                } else {
                    if (!urls.includes(url + '/' + pageMethod)) {
                        urls.push(url + '/' + pageMethod);
                    }
                }
            };

            Object.keys(controller.pageMethods).forEach(pageMethod => addUrl(pageMethod));

            const controllerBehaviors = Object.values(controller.behaviors).map(b => b.behavior);

            for (const beh of controllerBehaviors) {
                beh.pageMethods.forEach(pageMethod => addUrl(pageMethod));
            }
        });

        return urls;
    }

    /**
     * Finds owner by file path
     *
     * @param filePath
     * @returns
     */
    findOwner(filePath: string): Owner | undefined {
        // +1 for directory separator
        const filePathParts = filePath.substring(this.path.length + 1).split(path.sep);
        const ownerType = filePathParts.shift();

        switch (ownerType) {
            case 'app':
                return this.appDir;
            case 'modules':
                const moduleName = filePathParts.shift();
                return this.modules.find(m => m.name === moduleName);
            case Config.pluginsDirectory:
                const pluginCode = [filePathParts.shift(), filePathParts.shift()].join('.');
                return this.plugins.find(p => p.name === pluginCode);
            case Config.themesDirectory:
                const themeName = filePathParts.shift();
                return this.themes.find(t => t.name === themeName);
        }
    }

    /**
     * Find owner by name
     *
     * @param name
     * @returns
     */
    findOwnerByName(name: string): Owner | undefined {
        if (name === 'app') {
            return this.appDir;
        }

        return this.modules.find(m => m.name === name)
            || this.plugins.find(p => p.name === name)
            || this.themes.find(t => t.name === name);
    }
}
