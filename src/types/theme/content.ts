import path = require("path");
import { Theme } from "./theme";
import { ThemeFile } from "./themeFile";

export class Content extends ThemeFile {
    constructor(
        protected _theme: Theme,
        protected _name: string,
        protected _echoedVars: string[]
    ) {
        super(_theme, _name);
    }

    public get echoedVars() {
        return this._echoedVars;
    }

    public get filepath(): string {
        return [this.theme.name, 'content', this.name.replace('/', path.sep)].join(path.sep);
    }
}
