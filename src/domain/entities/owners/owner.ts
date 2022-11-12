/**
 * Base class for different file owners.
 * It may be module, plugin, theme, or app directory
 */
export abstract class Owner {
    constructor(private _path: string) { }

    /**
     * Path to current owner
     */
    get path(): string {
        return this._path;
    }
}
