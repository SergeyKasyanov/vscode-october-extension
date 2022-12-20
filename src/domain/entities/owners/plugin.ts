import path = require("path");
import { PhpHelpers } from "../../helpers/php-helpers";
import { TwigFiltersList } from "../../static/twig-filters";
import { TwigFunctionsList } from "../../static/twig-functions";
import { BackendOwner } from "./backend-owner";
import { ListsTwigFilters } from "./concenrs/lists-twig-filters";
import { ListsTwigFunctions } from "./concenrs/lists-twig-functions";

/**
 * Represents plugin of opened project
 */
export class Plugin extends BackendOwner {

    private _listsTwigFunctions: ListsTwigFunctions;
    private _listsTwigFilters: ListsTwigFilters;

    constructor(
        protected _name: string,
        protected _path: string
    ) {
        super(_name, _path);

        this._listsTwigFunctions = new ListsTwigFunctions(this);
        this._listsTwigFilters = new ListsTwigFilters(this);
    }

    /**
     * Backend menu context owner
     */
    get contextOwner(): string {
        const content = this.registrationFileContent;
        if (!content) {
            return '';
        }

        const ns = PhpHelpers.getNamespace(content, this.registrationFilePath);

        return ns.name.split('\\').join('.');
    }

    /**
     * Get plugin author
     */
    get author(): string {
        return this.name.split('.')[0];
    }

    /**
     * Get plugin name without author
     */
    get nameWithoutAuthor(): string {
        return this.name.split('.')[1];
    }

    /**
     * Path to Plugin.php
     */
    get registrationFilePath(): string {
        return path.join(this.path, 'Plugin.php');
    }

    /**
     * Twig functions registered in Provider.php
     */
    get twigFunctions(): TwigFunctionsList {
        return this._listsTwigFunctions.twigFunctions;
    }

    /**
     * Twig filters registered in Plugin.php
     */
    get twigFilters(): TwigFiltersList {
        return this._listsTwigFilters.twigFilters;
    }
}
