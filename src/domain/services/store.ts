import * as vscode from 'vscode';
import { OctoberEntity } from "../entities/october-entity";
import { AppDirectory } from "../entities/owners/app-directory";
import { Module } from "../entities/owners/module";
import { Owner } from '../entities/owners/owner';
import { Plugin } from "../entities/owners/plugin";
import { Theme } from "../entities/owners/theme";
import { Platform } from "../entities/platform";
import { Project } from "../entities/project";
import { EnvVariable, Event } from '../entities/types';

/**
 * Store for indexed workspaces data.
 */
export class Store {
    //#region Singleton
    private static _instance: Store;

    static get instance(): Store {
        if (!this._instance) {
            this._instance = new Store;
        }

        return this._instance;
    }

    private constructor() { }
    //#endregion

    private data: { [projectPath: string]: Project } = {};

    /**
     * Set platform of opened workspace folder
     *
     * @param projectPath
     * @param platform
     */
    setPlatform(projectPath: string, platform: Platform): void {
        this.ensureProjectAdded(projectPath);
        this.data[projectPath].platform = platform;
    }

    /**
     * Add app directory to opened workspace folder
     *
     * @param projectPath
     * @param appOwner
     */
    addAppDirectory(projectPath: string, appOwner: AppDirectory): void {
        this.ensureProjectAdded(projectPath);
        this.data[projectPath].appDir = appOwner;
    }

    /**
     * Add module to opened workspace folder
     *
     * @param projectPath
     * @param module
     */
    addModule(projectPath: string, module: Module): void {
        this.ensureProjectAdded(projectPath);
        this.data[projectPath].modules.push(module);
    }

    /**
     * Add plugin to opened workspace folder
     *
     * @param projectPath
     * @param plugin
     */
    addPlugin(projectPath: string, plugin: Plugin): void {
        this.ensureProjectAdded(projectPath);
        this.data[projectPath].plugins.push(plugin);
    }

    /**
     * Add theme to opened workspace folder
     *
     * @param projectPath
     * @param theme
     */
    addTheme(projectPath: string, theme: Theme): void {
        this.ensureProjectAdded(projectPath);
        this.data[projectPath].themes.push(theme);
    }

    /**
     * Add env variable to project index
     *
     * @param projectPath
     * @param envVariable
     */
    addEnvVariable(projectPath: string, envVariable: EnvVariable) {
        this.ensureProjectAdded(projectPath);
        this.data[projectPath].envVariables.push(envVariable);
    }

    /**
     * Add event to project index
     *
     * @param projectPath
     * @param envVariable
     */
    addEvent(projectPath: string, event: Event) {
        this.ensureProjectAdded(projectPath);
        this.data[projectPath].events.push(event);
    }

    /**
     * Remove workspace folder from store
     *
     * @param projectPath
     */
    removeWorkspaceFolder(projectPath: string): void {
        if (this.data[projectPath]) {
            delete this.data[projectPath];
        }
    }

    /**
     * List opened projects
     *
     * @returns
     */
    listProjects(): string[] {
        return Object.keys(this.data);
    }

    /**
     * Find workspace folder of given file path
     *
     * @param filePath
     * @returns
     */
    findProject(filePath: string): Project | undefined {
        const wsf = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
        if (!wsf) {
            return;
        }

        return this.data[wsf.uri.path];
    }

    /**
     * Finds owner by file path
     *
     * @param filePath
     * @returns
     */
    findOwner(filePath: string): Owner | undefined {
        return this
            .findProject(filePath)
            ?.findOwner(filePath);
    }

    /**
     * Find project entity by file path
     *
     * @param filePath
     * @returns
     */
    findEntity(filePath: string): OctoberEntity | undefined {
        return this
            .findOwner(filePath)
            ?.findEntityByPath(filePath);
    }

    /**
     * Make sure workspace folder is added to store.
     * Add if not.
     *
     * @param projectPath
     */
    private ensureProjectAdded(projectPath: string): void {
        if (!this.data[projectPath]) {
            this.data[projectPath] = new Project(projectPath);
        }
    }
}
