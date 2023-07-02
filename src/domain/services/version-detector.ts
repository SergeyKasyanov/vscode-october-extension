import { Version } from '../enums/october-version';
import { FsHelpers } from '../helpers/fs-helpers';
import { PathHelpers } from '../helpers/path-helpers';

/**
 * Detects version of OctoberCMS in opened project
 */
export class VersionDetector {

    /**
     * Detect version of OctoberCMS in opened project
     *
     * @param projectPath
     * @returns
     */
    detect(projectPath: string): Version | undefined {
        return this.tryDetectByComposerLock(projectPath)
            || this.tryDetectByComposerJson(projectPath)
            || this.tryDetectByDirectory(projectPath);
    }

    private tryDetectByComposerLock(projectPath: string): Version | undefined {
        const composerLockPath = PathHelpers.rootPath(projectPath, 'composer.lock');
        if (!FsHelpers.exists(composerLockPath)) {
            return;
        }

        const composerLockRaw = FsHelpers.readFile(composerLockPath);
        const composerLock = JSON.parse(composerLockRaw);
        const packages: Array<{ name: string, version: string }> = composerLock.packages;

        for (const pkg of packages) {
            if (pkg.name === 'october/system') {
                if (pkg.version.includes('1.0.')) {
                    return Version.oc10;
                } else if (pkg.version.includes('1.1.')) {
                    return Version.oc11;
                } else if (pkg.version.includes('2.0.')) {
                    return Version.oc20;
                } else if (pkg.version.includes('2.1.')) {
                    return Version.oc21;
                } else if (pkg.version.includes('2.2.')) {
                    return Version.oc22;
                } else if (pkg.version.includes('3.0.')) {
                    return Version.oc30;
                } else if (pkg.version.includes('3.1.')) {
                    return Version.oc31;
                } else if (pkg.version.includes('3.2.')) {
                    return Version.oc32;
                } else if (pkg.version.includes('3.3.')) {
                    return Version.oc33;
                } else if (pkg.version.includes('3.4.')) {
                    return Version.oc34;
                }
            }
        }
    }

    /**
     * Try to detect version by `require` in `composer.json`
     *
     * @param projectPath
     * @returns
     */
    private tryDetectByComposerJson(projectPath: string): Version | undefined {
        const composerJsonPath = PathHelpers.rootPath(projectPath, 'composer.json');
        if (!FsHelpers.exists(composerJsonPath)) {
            return;
        }

        const composerJsonRaw = FsHelpers.readFile(composerJsonPath);
        const composerJson = JSON.parse(composerJsonRaw);
        const requires: { [key: string]: string } = composerJson['require'];

        let version: string | undefined = undefined;

        if (requires.hasOwnProperty('october/all')) {
            version = requires['october/all'];
        } else if (requires.hasOwnProperty('october/system')) {
            version = requires['october/system'];
        } else {
            throw Error('"october/all" or "october/system" is not required by project');
        }

        if (version.includes('1.0')) {
            return Version.oc10;
        } else if (version.includes('1.1')) {
            return Version.oc11;
        } else if (version.includes('2.0')) {
            return Version.oc20;
        } else if (version.includes('2.1')) {
            return Version.oc21;
        } else if (version.includes('2.2')) {
            return Version.oc22;
        } else if (version.includes('3.0')) {
            return Version.oc30;
        } else if (version.includes('3.1')) {
            return Version.oc31;
        } else if (version.includes('3.2')) {
            return Version.oc32;
        } else if (version.includes('3.3')) {
            return Version.oc33;
        } else if (version.includes('3.4')) {
            return Version.oc34;
        }

        return undefined;
    }

    /**
     * Try to detect OctoberCMS in project by existence of `vendor/october` directory.
     * Returns only v1.0 or undefined.
     *
     * @param projectPath
     * @returns
     */
    private tryDetectByDirectory(projectPath: string): Version.oc10 | undefined {
        const vendorOctoberPath = PathHelpers.rootPath(projectPath, 'vendor/october');

        if (FsHelpers.exists(vendorOctoberPath)) {
            return Version.oc10;
        }

        return undefined;
    }
}
