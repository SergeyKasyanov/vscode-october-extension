import { AppDirectory } from "../entities/owners/app-directory";
import { Plugin } from "../entities/owners/plugin";
import { Theme } from "../entities/owners/theme";
import { Platform } from "../entities/platform";
import { Version } from "../enums/october-version";
import plugin = require("prettier-plugin-ini");
import { Module } from "../entities/owners/module";

export interface WorkspaceData {
    platform: Platform,
    app?: AppDirectory,
    modules: Module[],
    plugins: Plugin[],
    themes: Theme[]
}

/**
 * Store for indexed workspaces data.
 */
export class Store {
    //#region Singleton
    private static _instance: Store;

    private constructor() { }

    static get instance() {
        if (!this._instance) {
            this._instance = new Store;
        }

        return this._instance;
    }
    //#endregion

    private data: { [wsPath: string]: WorkspaceData } = {};

    setPlatform(wsPath: string, platform: Platform) {
        this.ensureWorkspaceAdded(wsPath);
        this.data[wsPath].platform = platform;
    }

    addAppOwner(wsPath: string, appOwner: AppDirectory) {
        this.ensureWorkspaceAdded(wsPath);
        this.data[wsPath].app = appOwner;
    }

    addModule(wsPath: string, module: Module) {
        this.ensureWorkspaceAdded(wsPath);
        this.data[wsPath].modules.push(module);
    }

    addPlugin(wsPath: string, plugin: Plugin) {
        this.ensureWorkspaceAdded(wsPath);
        this.data[wsPath].plugins.push(plugin);
    }

    addTheme(wsPath: string, theme: Theme) {
        this.ensureWorkspaceAdded(wsPath);
        this.data[wsPath].themes.push(theme);
    }

    private ensureWorkspaceAdded(wsPath: string) {
        if (!this.data[wsPath]) {
            this.data[wsPath] = {
                platform: new Platform(Version.oc10),
                modules: [],
                plugins: [],
                themes: []
            };
        }
    }
}
