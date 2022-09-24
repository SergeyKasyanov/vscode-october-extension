import path = require('path');
import * as vscode from 'vscode';
import { GlobPattern } from "vscode";
import { pluginsPath } from "../../helpers/paths";
import { TwigFilter } from '../../types/twig/twigFilter';
import { PhpDataLoader } from "./base/phpDataLoader";
import phpCode from './php/twigFiltersLoaderCode';

export class TwigFiltersDataLoader extends PhpDataLoader {

    private static instance: TwigFiltersDataLoader;

    public static getInstance(): TwigFiltersDataLoader {
        if (!this.instance) {
            this.instance = new TwigFiltersDataLoader();
        }

        return this.instance;
    }

    protected _data: { [theme: string]: TwigFilter } = {};

    public get data(): { [theme: string]: TwigFilter } {
        return this._data;
    }

    protected getPhpScript(): string {
        return phpCode;
    }

    protected processData(data: any): void {
        this._data = data;
    }

    protected getWatcherPathPattern(): GlobPattern {
        return new vscode.RelativePattern(pluginsPath(), "**" + path.sep + "Plugin.php");
    }
}
