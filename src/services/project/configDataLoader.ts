import * as vscode from "vscode";
import { pluginsDirectory } from "../../config";
import { ConfigKey } from "../../types/configKey";
import { rootPath } from "../../helpers/paths";
import { PhpDataLoader } from "./base/phpDataLoader";
import phpCode from './php/configLoaderCode';
import path = require("path");
const isNumber = require('is-number');

export class ConfigDataLoader extends PhpDataLoader {

    private tmpData: { [key: string]: ConfigKey } = {};
    protected _data: { [key: string]: ConfigKey } = {};

    private static instance: ConfigDataLoader;

    public static getInstance(): ConfigDataLoader {
        if (!this.instance) {
            this.instance = new ConfigDataLoader();
        }

        return this.instance;
    }

    protected getPhpScript(): string {
        return phpCode;
    }

    protected processData(data: any): void {
        this.tmpData = {};

        this.processConfig(data);

        this._data = this.tmpData;
    }

    private processConfig(data: any, prefix: string = ''): any {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];

                let name = key;
                if (name.startsWith('*::')) {
                    name = name.slice(3);
                }

                if (value instanceof Object && !this.objectHasNumericKeys(value)) {
                    this.processConfig(value, prefix + name + '.');
                } else {
                    let val;

                    if (['string', 'number', 'boolean'].includes(typeof value)) {
                        val = value.toString();
                    }

                    this.tmpData[prefix + name] = {
                        key: prefix + name,
                        value: val
                    };
                }
            }
        }
    }

    private objectHasNumericKeys(obj: any) {
        for (const key of Object.keys(obj)) {
            if (!isNumber(key)) {
                return false;
            }
        }

        return true;
    }

    protected getWatcherPathPattern(): vscode.GlobPattern {
        const plugins = pluginsDirectory();
        return new vscode.RelativePattern(rootPath(), path.join(plugins, "**", "config", "*.php"));
    }
}
