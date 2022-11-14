import path = require('path');
import * as fs from 'fs';
import * as vscode from 'vscode';
import { Config } from '../../config';
import { Behavior } from '../entities/classes/plugin/behavior';
import { AppDirectory } from '../entities/owners/app-directory';
import { Module } from '../entities/owners/module';
import { Plugin } from '../entities/owners/plugin';
import { Theme } from '../entities/owners/theme';
import { Platform } from '../entities/platform';
import { WorkspacePathHelpers } from '../helpers/ws-path-helpers';
import { BehaviorsIndexer } from './indexer/behaviors-indexer';
import { Store } from './store';
import { VersionDetector } from './version-detector';

/**
 * Indexes workspaces
 */
export class Indexer {
    private store: Store;
    private versionDetector: VersionDetector;
    private excludes: string[];

    private wsFolder: vscode.WorkspaceFolder | undefined;
    private wsPath: string | undefined;
    private platform: Platform | undefined;

    constructor() {
        this.store = Store.instance;

        this.versionDetector = new VersionDetector();

        this.excludes = Config.excludeFromIndex;
    }

    /**
     * Index workspace folder
     *
     * @param wsFolder
     * @returns
     */
    index(wsFolder: vscode.WorkspaceFolder) {
        this.wsFolder = wsFolder;
        this.wsPath = wsFolder.uri.path;

        const version = this.versionDetector.detect(wsFolder);
        if (!version) {
            return;
        }

        this.platform = new Platform(version);
        this.store.setPlatform(this.wsPath, this.platform);

        try {
            if (this.platform!.hasAppDirectory) {
                const appOwner = new AppDirectory('app', 'app');
                this.indexBackendOwner(appOwner);
                this.store.addAppOwner(this.wsPath, appOwner);
            }
        } catch (err) {
            console.error(err);
        }

        try {
            for (const module of this.listModules()) {
                this.indexBackendOwner(module);
                this.store.addModule(this.wsPath, module);
            }
        } catch (err) {
            console.error(err);
        }

        try {
            for (const plugin of this.listPlugins()) {
                this.indexBackendOwner(plugin);
                this.store.addPlugin(this.wsPath, plugin);
            }
        } catch (err) {
            console.error(err);
        }

        try {
            for (const theme of this.listThemes()) {
                this.indexTheme(theme);
                this.store.addTheme(this.wsPath, theme);
            }
        } catch (err) {
            console.error(err);
        }

        this.clear();
    }

    /**
     * List modules of project
     *
     * @returns
     */
    private listModules(): Module[] {
        const modules: Module[] = [];

        fs.readdirSync(WorkspacePathHelpers.modulesPath(this.wsFolder!), { withFileTypes: true })
            .map(entry => {
                if (entry.isDirectory()) {
                    const modulePath = path.join('modules', entry.name);

                    modules.push(new Module(entry.name, modulePath));
                }
            });

        return modules;
    }

    /**
     * List plugins of project
     *
     * @returns
     */
    private listPlugins(): Plugin[] {
        const plugins: Plugin[] = [];

        fs.readdirSync(WorkspacePathHelpers.pluginsPath(this.wsFolder!), { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .forEach(pluginVendor => {
                fs.readdirSync(WorkspacePathHelpers.pluginsPath(this.wsFolder!, pluginVendor.name), { withFileTypes: true })
                    .forEach(entry => {
                        if (entry.isDirectory()) {
                            const pluginPath = path.join(Config.pluginsDirectory, pluginVendor.name, entry.name);
                            const pluginCode = [pluginVendor.name, entry.name].join('.');

                            plugins.push(new Plugin(pluginCode, pluginPath));
                        }
                    });
            });

        return plugins;
    }

    /**
     * List themes of project
     *
     * @returns
     */
    private listThemes(): Theme[] {
        const themes: Theme[] = [];

        fs.readdirSync(WorkspacePathHelpers.themesPath(this.wsFolder!), { withFileTypes: true })
            .map(entry => {
                if (entry.isDirectory()) {
                    const themePath = path.join(Config.themesDirectory, entry.name);

                    themes.push(new Theme(entry.name, themePath));
                }
            });

        return themes;
    }

    /**
     * Load data from module/plugin
     *
     * @param owner
     */
    private indexBackendOwner(owner: Plugin | Module | AppDirectory) {
        for (const dir of Behavior.getBaseDirectories()) {
            if (this.excludes.includes(dir)) {
                continue;
            }

            const behaviorsPath = path.join(this.wsFolder!.uri.path, owner.path, dir);

            if (!fs.existsSync(behaviorsPath)) {
                continue;
            }

            const octoberClassIndexer = new BehaviorsIndexer();
            owner.behaviors = octoberClassIndexer.index(owner, behaviorsPath);
        }
    }

    /**
     * Load data from theme
     *
     * @param theme
     */
    private indexTheme(theme: Theme) {

    }

    /**
     * Clear internal indexer properties.
     */
    private clear() {
        this.wsFolder = undefined;
        this.wsPath = undefined;
        this.platform = undefined;
    }
}
