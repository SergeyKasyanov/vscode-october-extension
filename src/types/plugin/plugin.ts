import path = require("path");
import { pluginsPath } from "../../helpers/paths";

export type PluginMenu = { [main: string]: string[] };

export class Plugin {
    private _author: string;
    private _name: string;

    constructor(
        private _code: string,
        private _menu: PluginMenu = {}
    ) {
        [this._author, this._name] = Plugin.splitCode(_code);
    }

    public static splitCode(code: string) {
        return code.split('.');
    }

    public get code(): string {
        return this._code;
    }

    public get author(): string {
        return this._author;
    }

    public get name(): string {
        return this._name;
    }

    public get menu(): PluginMenu {
        return this._menu;
    }

    public filePath(location: string = '') {
        let parts = [this.author.toLowerCase(), this.name.toLowerCase()];
        if (location.length > 0) {
            parts.push(location);
        }

        return pluginsPath(path.join(...parts));
    }
}
