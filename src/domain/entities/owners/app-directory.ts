import path = require("path");
import { TwigFiltersList } from "../../static/twig-filters";
import { TwigFunctionsList } from "../../static/twig-functions";
import { BackendOwner } from "./backend-owner";
import { ListsTwigFilters } from "./concenrs/lists-twig-filters";
import { ListsTwigFunctions } from "./concenrs/lists-twig-functions";

/**
 * Represents app ("the project level plugin") of opened project
 */
export class AppDirectory extends BackendOwner {

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
        return 'App';
    }

    /**
     * Path to Provider.php of app directory
     */
    get registrationFilePath(): string {
        return path.join(this.path, 'Provider.php');
    }

    /**
     * Twig functions registered in Provider.php
     */
    get twigFunctions(): TwigFunctionsList {
        return this._listsTwigFunctions.twigFunctions;
    }

    /**
     * Twig filters registered in Provider.php
     */
    get twigFilters(): TwigFiltersList {
        return this._listsTwigFilters.twigFilters;
    }
}
