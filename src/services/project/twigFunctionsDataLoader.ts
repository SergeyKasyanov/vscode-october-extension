import path = require('path');
import * as vscode from 'vscode';
import { GlobPattern } from "vscode";
import { pluginsPath } from "../../helpers/paths";
import { TwigFunction } from '../../types/twig/twigFunction';
import { PhpDataLoader } from "./base/phpDataLoader";
import phpCode from './php/twigFunctionsLoaderCode';
import defaultTwigFunctions from './twig/defaultTwigFunctions';

export class TwigFunctionsDataLoader extends PhpDataLoader {

    private static instance: TwigFunctionsDataLoader;

    public static getInstance(): TwigFunctionsDataLoader {
        if (!this.instance) {
            this.instance = new TwigFunctionsDataLoader();
        }

        return this.instance;
    }

    protected _data: { [theme: string]: TwigFunction } = {};

    public get data(): { [theme: string]: TwigFunction } {
        return this._data;
    }

    protected getPhpScript(): string {
        return phpCode;
    }

    protected processData(data: any): void {
        for (const name in defaultTwigFunctions) {
            if (Object.prototype.hasOwnProperty.call(defaultTwigFunctions, name)) {
                const func = defaultTwigFunctions[name];
                data[name] = func;
            }
        }

        this._data = data;
    }

    protected getWatcherPathPattern(): GlobPattern {
        return new vscode.RelativePattern(pluginsPath(), "**" + path.sep + "Plugin.php");
    }
}
