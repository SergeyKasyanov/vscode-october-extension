/**
 * Base class for different file owners.
 * It may be module, plugin, theme, or app directory
 */
export abstract class Owner {
    constructor(
        private _name: string,
        private _path: string
    ) { }

    /**
     * Name of the owner
     */
    get name(): string {
        return this._name;
    }

    /**
     * Path to owner from the root of workspace folder
     */
    get path(): string {
        return this._path;
    }
}
