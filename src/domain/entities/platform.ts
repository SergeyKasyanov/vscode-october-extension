import { Version } from "../enums/october-version";

/**
 * Represents OctoberCMS platform of opened project.
 */
export class Platform {
    constructor(private _version: Version) { }

    /**
     * Version of OctoberCMS used in opened project
     */
    get version() {
        return this._version;
    };

    //
    // Platform version specific stuff
    //

    /**
     * Returns main extension for backend views
     */
    get mainBackendViewExtension(): "php" | "htm" {
        return this._version >= Version.oc30 ? 'php' : 'htm';
    }

    /**
     * Returns supported extensions for backend views
     */
    get backendViewExtensions(): string[] {
        return this._version >= Version.oc30 ? ['php', 'htm'] : ['htm'];
    }

    /**
     * Has `tailor` modules
     */
    get hasTailor(): boolean {
        return this._version >= Version.oc30;
    }

    /**
     * Has `app` directory
     */
    get hasAppDirectory(): boolean {
        return this._version >= Version.oc30;
    }

    /**
     * Uses `$this->id();` in migrations
     */
    get usesIdMethodInMigrations(): boolean {
        return this._version >= Version.oc30;
    }

    /**
     * Has `SortableRelation` trait
     */
    get hasSortableRelationTrait(): boolean {
        return this._version >= Version.oc30;
    }

    /**
     * Has multisite feature
     */
    get hasMultisite(): boolean {
        return this._version >= Version.oc31;
    }

    /**
     * Has `FilterWidget` class
     */
    get hasFilterWidgets(): boolean {
        return this._version >= Version.oc30;
    }
}
