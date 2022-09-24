import path = require("path");
import { Theme } from "./theme";
import { ThemeMarkupFile } from "./themeFile";

export class Layout extends ThemeMarkupFile {
    constructor(
        protected _theme: Theme,
        protected _name: string,
        protected _properties: { [name: string]: string } = {},
        protected _components: { [alias: string]: string } = {},
        protected _definedVars: string[] = [],
        protected _partials: string[] = [],
        protected _contents: string[] = [],
        protected _placeholders: string[] = [],
        protected _ajaxMethods: string[] = [],
    ) {
        super(_theme, _name, _properties, _components, _definedVars, _partials, _contents);
    }

    public get placeholders() {
        return this._placeholders;
    }

    public get ajaxMethods() {
        return this._ajaxMethods;
    }

    public get filepath(): string {
        return [this.theme.name, 'layouts', this.name.replace('/', path.sep) + '.htm'].join(path.sep);
    }
}
