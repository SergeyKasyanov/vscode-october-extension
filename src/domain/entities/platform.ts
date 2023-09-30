import { Version, versionNames } from "../enums/october-version";

/**
 * Represents OctoberCMS platform of opened project.
 */
export class Platform {
    constructor(
        private _version: Version
    ) { }

    /**
     * Version of OctoberCMS used in opened project
     */
    get version() {
        return this._version;
    };

    /**
     * Human readable version number
     */
    get versionName() {
        return versionNames[this._version];
    }

    //
    // Platform version specific stuff
    //

    /**
     * Main extension for backend views
     */
    get mainBackendViewExtension(): "php" | "htm" {
        return this._version >= Version.oc30 ? 'php' : 'htm';
    }

    /**
     * Supported extensions for backend views
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

    /**
     * Uses bootstrap5 in admin panel
     */
    get usesBootstrap5(): boolean {
        return this._version >= Version.oc30;
    }

    /**
     * Uses $signature in artisan commands
     */
    get usesSignaturesInCommands(): boolean {
        return this._version >= Version.oc32;
    }

    /**
     * Uses anonymous migrations in plugins
     */
    get supportAnonymousMigrations(): boolean {
        return this._version >= Version.oc33;
    }

    /**
     * Has page snippets support
     */
    get hasPageSnippetsSupport(): boolean {
        return this._version >= Version.oc34;
    }

    /**
     * Has support for side menu item types
     */
    get hasMenuItemType(): boolean {
        return this._version >= Version.oc35;
    }
}
