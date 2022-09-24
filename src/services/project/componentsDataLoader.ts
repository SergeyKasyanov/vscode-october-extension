import path = require('path');
import * as vscode from 'vscode';
import { pluginsDirectory } from '../../config';
import { rootPath } from "../../helpers/paths";
import { Component } from '../../types/plugin/component';
import { PhpDataLoader } from './base/phpDataLoader';
import phpCode from './php/componentLoaderCode';

export class ComponentsDataLoader extends PhpDataLoader {

    private static instance: ComponentsDataLoader;

    public static getInstance(): ComponentsDataLoader {
        if (!this.instance) {
            this.instance = new ComponentsDataLoader();
        }

        return this.instance;
    }

    protected getPhpScript(): string {
        return phpCode;
    }

    protected processData(data: any): void {
        let components: { [alias: string]: Component } = {};

        for (const component in data) {
            if (Object.prototype.hasOwnProperty.call(data, component)) {
                components[component] = new Component(component, data[component]);
            }
        }

        this._data = components;
    }

    protected getWatcherPathPattern(): vscode.GlobPattern {
        const plugins = pluginsDirectory();
        const pattern = `{${plugins}${path.sep}**${path.sep}components${path.sep}*.php,${plugins}${path.sep}**${path.sep}Plugin.php}`;
        return new vscode.RelativePattern(rootPath(), pattern);
    }
}
