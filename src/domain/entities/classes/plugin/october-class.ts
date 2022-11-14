import { Owner } from "../../owners/owner";

export abstract class OctoberClass {
    constructor(
        private _owner: Owner,
        private _name: string,
        private _path: string
    ) {
    }

    get owner(): Owner {
        return this._owner;
    }

    get path(): string {
        return this._path;
    }

    get name(): string {
        return this._name;
    }

    /**
     * Plugin/module directory for this kind of classes
     */
    static getBaseDirectories(): string[] {
        throw Error();
    }
}
