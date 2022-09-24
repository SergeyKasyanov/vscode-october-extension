import { Theme } from "./theme";

export abstract class ThemeFile {
    constructor(
        protected _theme: Theme,
        protected _name: string,
    ) { }

    public get theme(): Theme {
        return this._theme;
    }

    public get name(): string {
        return this._name;
    }

    public abstract get filepath(): string;
}

export abstract class ThemeMarkupFile extends ThemeFile {
    constructor(
        protected _theme: Theme,
        protected _name: string,
        protected _properties: { [name: string]: string } = {},
        protected _components: { [alias: string]: string } = {},
        protected _definedVars: string[] = [],
        protected _partials: string[] = [],
        protected _contents: string[] = []
    ) {
        super(_theme, _name);
    }

    public get properties() {
        return this._properties;
    }

    public get components() {
        return this._components;
    }

    public get definedVars() {
        return this._definedVars;
    }

    public get partials() {
        return this._partials;
    }

    public get contents() {
        return this._contents;
    }

    public get description() {
        return this.getProperty('description');
    }

    public getProperty(name: string): string | undefined {
        return this._properties[name];
    }

    public getComponent(alias: string): string | undefined {
        return this._components[alias];
    }
}
