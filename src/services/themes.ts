import * as fs from 'fs';
import * as vscode from 'vscode';
import { themesPath } from '../helpers/paths';
import { ThemeFileUtils } from '../helpers/themeFileUtils';
import { FileType } from '../types/theme/fileType';
import { Theme } from "../types/theme/theme";
import { ThemeFile } from '../types/theme/themeFile';
import { Loader } from './themes/loader';
import path = require('path');

export class Themes {

    private static _instance: Themes;
    private loader: Loader;
    private _themes: { [theme: string]: Theme } = {};

    private constructor() {
        this.loader = new Loader;

        this._themes = this.loader.loadThemes();

        this.startWatcher();
    }

    public static get instance(): Themes {
        if (!this._instance) {
            this._instance = new Themes();
        }

        return this._instance;
    }

    public get themes(): { [theme: string]: Theme } {
        return this._themes;
    }

    public getTheme(name: string): Theme | undefined {
        return this._themes[name];
    }

    public isThemeFile(filePath: string) {
        return filePath.startsWith(themesPath());
    }

    public getFileByPath(filePath: string): ThemeFile | undefined {
        const parsed = ThemeFileUtils.parseFileName(filePath);
        if (!parsed.theme || !this._themes[parsed.theme]) {
            return undefined;
        }

        switch (parsed.type) {
            case FileType.layouts:
                return this._themes[parsed.theme].getLayout(parsed.file);
            case FileType.pages:
                return this._themes[parsed.theme].getPage(parsed.file);
            case FileType.partials:
                return this._themes[parsed.theme].getPartial(parsed.file);
            case FileType.content:
                return this._themes[parsed.theme].getContent(`${parsed.file}.${parsed.ext}`);
        }
    }

    private updating: { [filename: string]: boolean } = {};

    private startWatcher() {
        const pattern = new vscode.RelativePattern(themesPath(), "**" + path.sep + "*.{htm,txt,md}");

        let watcher = vscode.workspace.createFileSystemWatcher(pattern);

        watcher.onDidCreate((e: vscode.Uri) => {
            console.debug('File created: ', e.path);

            this.updateFileData(e.path);
        });

        watcher.onDidChange((e: vscode.Uri) => {
            console.debug('File changed: ', e.path);

            this.updating[e.path] = false;
            this.updateFileData(e.path);
        });

        watcher.onDidDelete((e: vscode.Uri) => {
            console.debug('File deleted: ' + e.path);

            this.onDeleteFile(e.path);
        });
    }

    public updateFileData(filepath: string, content?: string) {
        if (this.updating[filepath]) {
            return;
        }

        this.updating[filepath] = true;
        console.debug('Updating: ', filepath);

        const parsed = ThemeFileUtils.parseFileName(filepath);
        const theme = this.getTheme(parsed.theme);

        if (!theme) {
            this._themes[parsed.theme] = this.loader.makeTheme(parsed.theme);
            return;
        }

        content = content ? content : fs.readFileSync(filepath).toString();

        switch (parsed.type) {
            case FileType.layouts:
                this._themes[parsed.theme].addLayouts([this.loader.makeLayout(theme, parsed.file, content)]);
                break;
            case FileType.pages:
                this._themes[parsed.theme].addPages([this.loader.makePage(theme, parsed.file, content)]);
                break;
            case FileType.partials:
                this._themes[parsed.theme].addPartials([this.loader.makePartial(theme, parsed.file, content)]);
                break;
            case FileType.content:
                this._themes[parsed.theme].addContents([this.loader.makeContent(theme, parsed.file + '.' + parsed.ext, content)]);
                break;
        }

        setTimeout(() => {
            this.updating[filepath] = false;
        }, 2000);
    }

    private onDeleteFile(filepath: string) {
        const parsed = ThemeFileUtils.parseFileName(filepath);
        const theme = this.getTheme(parsed.theme);

        if (!theme) {
            return;
        }

        switch (parsed.type) {
            case FileType.layouts:
                this._themes[parsed.theme].removeLayout(parsed.file);
                break;
            case FileType.pages:
                this._themes[parsed.theme].removePage(parsed.file);
                break;
            case FileType.partials:
                this._themes[parsed.theme].removePartial(parsed.file);
                break;
            case FileType.content:
                this._themes[parsed.theme].removeContent(parsed.file + '.' + parsed.ext);
                break;
        }
    }

}
