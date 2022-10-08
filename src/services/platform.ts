import * as fs from 'fs';
import { rootPath } from '../helpers/paths';
import { Version, versionNames } from '../types/octoberVersion';

export class Platform {

    private static instance: Platform;

    private _currentVersion: Version | undefined;

    private constructor() {
        this.detectVersion();
    }

    public static getInstance(): Platform {
        if (!this.instance) {
            this.instance = new Platform();
        }

        return this.instance;
    }

    public get currentVersion() {
        return this._currentVersion;
    }

    public getCurrentVersionName(): string | undefined {
        if (this._currentVersion === undefined) {
            return undefined;
        }

        return versionNames[this._currentVersion];
    }

    private detectVersion() {
        try {
            this.tryDetectByComposerJson();
        } catch (err) {
            console.error(err);
        }

        if (this._currentVersion === undefined) {
            this.tryDetectByDirectory();
        }
    }

    private tryDetectByComposerJson() {
        const composerJsonRaw = fs.readFileSync(rootPath('composer.json'));
        const composerJson = JSON.parse(composerJsonRaw.toString());
        const requires: { [key: string]: string } = composerJson['require'];

        let version: string | undefined = undefined;

        if (requires.hasOwnProperty('october/all')) {
            version = requires['october/all'];
        } else if (requires.hasOwnProperty('october/system')) {
            version = requires['october/system'];
        }

        if (version === undefined) {
            throw Error('"october/all" or "october/system" is not required by project');
        }

        if (version.includes('1.0')) {
            this._currentVersion = Version.oc10;
        } else if (version.includes('1.1')) {
            this._currentVersion = Version.oc11;
        } else if (version.includes('2.0')) {
            this._currentVersion = Version.oc20;
        } else if (version.includes('2.1')) {
            this._currentVersion = Version.oc21;
        } else if (version.includes('2.2')) {
            this._currentVersion = Version.oc22;
        } else if (version.includes('3.0')) {
            this._currentVersion = Version.oc30;
        } else if (version.includes('3.1')) {
            this._currentVersion = Version.oc31;
        }
    }

    private tryDetectByDirectory() {
        if (this._currentVersion === undefined) {
            if (fs.existsSync(rootPath('vendor/october'))) {
                this._currentVersion = Version.oc10;
            }
        }
    }

    //
    // Platform version specific stuff
    //

    /**
     * getBackendViewExtension
     */
    public getMainBackendViewExtension() {
        if (this._currentVersion && this._currentVersion >= Version.oc30) {
            return 'php';
        }

        return 'htm';
    }

    public getBackendViewExtensions() {
        if (this._currentVersion && this._currentVersion >= Version.oc30) {
            return ['php', 'htm'];
        }

        return ['htm'];
    }

    public hasTailor() {
        return this._currentVersion && this._currentVersion >= Version.oc30;
    }

    public usesTableIdInMigrations() {
        return this._currentVersion && this._currentVersion >= Version.oc30;
    }

    public hasSortableRelationTrait() {
        return this._currentVersion && this._currentVersion >= Version.oc30;
    }

    public hasMultisite() {
        return this._currentVersion && this._currentVersion >= Version.oc31;
    }

    public hasFilterWidgets() {
        return this._currentVersion && this._currentVersion >= Version.oc30;
    }

}
