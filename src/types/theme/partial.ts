import path = require("path");
import { Theme } from "./theme";
import { ThemeMarkupFile } from "./themeFile";

export class Partial extends ThemeMarkupFile {
    constructor(
        protected _theme: Theme,
        protected _name: string,
        protected _properties: { [name: string]: string } = {},
        protected _components: { [alias: string]: string } = {},
        protected _definedVars: string[] = [],
        protected _partials: string[] = [],
        protected _contents: string[] = [],
        protected _echoedVars: string[] = []
    ) {
        super(_theme, _name, _properties, _components, _definedVars, _partials, _contents);
    }

    public get echoedVars() {
        return this._echoedVars;
    }

    public get filepath(): string {
        return [this.theme.name, 'partials', this.name.replace('/', path.sep) + '.htm'].join(path.sep);
    }
}
