import * as vscode from 'vscode';
import { Config } from '../../config';
import { Platform } from '../entities/platform';
import { BackendIndexer } from './indexer/backend-indexer';
import { ThemesIndexer } from './indexer/themes-indexer';
import { Store } from './store';
import { VersionDetector } from './version-detector';
import path = require('path');
import { watch } from 'fs';
import { EnvIndexer } from './indexer/env-indexer';

/**
 * Indexes workspaces
 */
export class Indexer {
    //#region Singleton
    private static _instance: Indexer;

    static get instance(): Indexer {
        if (!this._instance) {
            this._instance = new Indexer;
        }

        return this._instance;
    }

    private constructor() {
        this.store = Store.instance;
        this.versionDetector = new VersionDetector();
        this.backendIndexer = new BackendIndexer(this.store);
        this.themesIndexer = new ThemesIndexer(this.store);
        this.envIndexer = new EnvIndexer(this.store);
    }
    //#endregion

    private store: Store;
    private versionDetector: VersionDetector;
    private backendIndexer: BackendIndexer;
    private themesIndexer: ThemesIndexer;
    private envIndexer: EnvIndexer;
    private watchers: { [path: string]: vscode.FileSystemWatcher[] } = {};

    /**
     * Index opened workspace folders.
     * Start listeners on workspace events.
     */
    start(): void {
        this.indexWorkspaceFolders();
        this.listenToWorkspaceEvents();
    }

    /**
     * Stop indexer
     */
    stop(): void {
        for (const ws of vscode.workspace.workspaceFolders || []) {
            this.stopWatchers(ws.uri.path);
        }
    }

    /**
     * Listen to change workspace configuration events
     */
    private listenToWorkspaceEvents(): void {
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('octoberCode')) {
                this.indexWorkspaceFolders();
            }
        });

        vscode.workspace.onDidChangeWorkspaceFolders(event => {
            event.added.forEach(ws => {
                this.indexWorkspaceFolder(ws.uri.path);
                this.startWatchers(ws.uri.path);
            });

            event.removed.forEach(ws => {
                this.store.removeWorkspaceFolder(ws.uri.path);
                this.stopWatchers(ws.uri.path);
            });
        });
    }

    /**
     * Index opened workspace folders.
     */
    private indexWorkspaceFolders(): void {
        for (const ws of vscode.workspace.workspaceFolders || []) {
            this.store.removeWorkspaceFolder(ws.uri.path);

            this.indexWorkspaceFolder(ws.uri.path);
            this.startWatchers(ws.uri.path);
        }
    }

    /**
     * Index workspace folder
     *
     * @param projectPath
     * @returns
     */
    private indexWorkspaceFolder(projectPath: string): void {
        const version = this.versionDetector.detect(projectPath);
        if (version === undefined) {
            return;
        }

        const platform = new Platform(version);
        this.store.setPlatform(projectPath, platform);

        this.backendIndexer.index(platform, projectPath);
        this.themesIndexer.index(projectPath);
        this.envIndexer.index(projectPath);
    }

    /**
     * Starts listeners to filesystem events on specified workspace folder
     *
     * @param projectPath
     */
    private startWatchers(projectPath: string): void {
        this.startBackendWatcher(projectPath);
        this.startThemesWatcher(projectPath);
        this.startEnvWatcher(projectPath);
    }

    /**
     * Starts listeners to filesystem events for app,plugins and modules files
     *
     * @param projectPath
     */
    private startBackendWatcher(projectPath: string) {
        const backendPattern = new vscode.RelativePattern(
            projectPath,
            path.join(`{app,modules,${Config.pluginsDirectory}}`, '**', '*.{php,yaml}')
        );

        const watcher = vscode.workspace.createFileSystemWatcher(backendPattern);

        watcher.onDidCreate(uri => this.backendIndexer.indexFile(projectPath, uri.path));
        watcher.onDidChange(uri => this.backendIndexer.indexFile(projectPath, uri.path));
        watcher.onDidDelete(uri => this.backendIndexer.deleteFile(uri.path));

        if (!this.watchers[projectPath]) {
            this.watchers[projectPath] = [];
        }

        this.watchers[projectPath].push(watcher);
    }

    /**
     * Starts listeners to filesystem events for themes files
     *
     * @param projectPath
     */
    private startThemesWatcher(projectPath: string) {
        const themesPattern = new vscode.RelativePattern(
            projectPath,
            path.join(`${Config.themesDirectory}`, '**', '*.{htm,md,txt}')
        );

        const watcher = vscode.workspace.createFileSystemWatcher(themesPattern);

        watcher.onDidCreate(uri => this.themesIndexer.indexFile(projectPath, uri.path));
        watcher.onDidChange(uri => this.themesIndexer.indexFile(projectPath, uri.path));
        watcher.onDidDelete(uri => this.themesIndexer.deleteFile(projectPath, uri.path));

        if (!this.watchers[projectPath]) {
            this.watchers[projectPath] = [];
        }

        this.watchers[projectPath].push(watcher);
    }

    private startEnvWatcher(projectPath: string) {
        const envPattern = new vscode.RelativePattern(
            projectPath,
            '.env*'
        );

        const watcher = vscode.workspace.createFileSystemWatcher(envPattern);

        watcher.onDidCreate(uri => this.envIndexer.indexFile(projectPath, uri.path));
        watcher.onDidChange(uri => this.envIndexer.indexFile(projectPath, uri.path));
        watcher.onDidDelete(uri => this.envIndexer.deleteFile(projectPath, uri.path));

        if (!this.watchers[projectPath]) {
            this.watchers[projectPath] = [];
        }

        this.watchers[projectPath].push(watcher);
    }

    /**
     * Stops listeners to filesystem events on specified workspace folder
     *
     * @param projectPath
     */
    private stopWatchers(projectPath: string) {
        for (const watcher of this.watchers[projectPath]) {
            watcher.dispose();
        }

        delete this.watchers[projectPath];
    }
}
