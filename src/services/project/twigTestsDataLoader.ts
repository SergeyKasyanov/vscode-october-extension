import * as vscode from 'vscode';
import { TwigTest } from '../../types/twig/twigTest';
import { PhpDataLoader } from "./base/phpDataLoader";
import phpCode from './php/twigTestsLoaderCode';

export class TwigTestsDataLoader extends PhpDataLoader {

    private static instance: TwigTestsDataLoader;

    public static getInstance(): TwigTestsDataLoader {
        if (!this.instance) {
            this.instance = new TwigTestsDataLoader();
        }

        return this.instance;
    }

    protected _data: { [theme: string]: TwigTest } = {};

    public get data(): { [theme: string]: TwigTest } {
        return this._data;
    }

    protected getPhpScript(): string {
        return phpCode;
    }

    protected processData(data: any): void {
        this._data = data;
    }

    protected getWatcherPathPattern(): vscode.GlobPattern | undefined {
        return;
    }
}
