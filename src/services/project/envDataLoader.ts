import * as fs from 'fs';
import * as vscode from 'vscode';
import { rootPath } from '../../helpers/paths';

export class EnvDataLoader {
    private static _instance: EnvDataLoader;

    public static get instance(): EnvDataLoader {
        if (!this._instance) {
            this._instance = new EnvDataLoader;
        }

        return this._instance;
    }

    private updating: boolean = false;

    private _envKeys: string[] = [];

    private constructor() {
        this.loadData();
        this.startWatcher();
    }

    public get envKeys(): string[] {
        return this._envKeys;
    }

    private loadData() {
        if (this.updating) {
            return;
        }

        this.updating = true;

        let envKeys = [];

        const envPath = rootPath('.env');
        if (!fs.existsSync(envPath)) {
            this.updating = false;
            this._envKeys = [];

            return;
        }

        const envContent = fs.readFileSync(envPath).toString();
        const lines = envContent.split(/\r?\n/);

        for (const line of lines) {
            if (line.trim().length === 0) {
                continue;
            }

            const parts = line.trim().split('=');
            envKeys.push(parts[0].trim());
        }

        this._envKeys = envKeys;

        this.updating = false;
    }

    public refreshData() {
        this.loadData();
    }

    private startWatcher() {
        let watcher = vscode.workspace.createFileSystemWatcher(rootPath('.env'));

        watcher.onDidCreate((e: vscode.Uri) => {
            console.debug('File created: ', e.path);

            this.loadData();
        });

        watcher.onDidChange((e: vscode.Uri) => {
            console.debug('File changed: ', e.path);

            this.updating = false;
            this.loadData();
        });

        watcher.onDidDelete((e: vscode.Uri) => {
            console.debug('File deleted: ' + e.path);

            this.updating = false;
            this._envKeys = [];
        });
    }
}
