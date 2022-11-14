import * as vscode from 'vscode';
import * as fs from 'fs';
import { Version } from '../enums/october-version';
import { WorkspacePathHelpers } from '../helpers/ws-path-helpers';

/**
 * Detects version of OctoberCMS in opened project
 */
export class VersionDetector {

    /**
     * Detect version of OctoberCMS in opened project
     *
     * @param wsFolder
     * @returns
     */
    detect(wsFolder: vscode.WorkspaceFolder): Version | undefined {
        return this.tryDetectByComposerJson(wsFolder)
            || this.tryDetectByDirectory(wsFolder);
    }

    /**
     * Try to detect version by `require` in `composer.json`
     *
     * @param wsFolder
     * @returns
     */
    private tryDetectByComposerJson(wsFolder: vscode.WorkspaceFolder): Version | undefined {
        const composerJsonPath = WorkspacePathHelpers.rootPath(wsFolder, 'composer.json');
        const composerJsonRaw = fs.readFileSync(composerJsonPath);
        const composerJson = JSON.parse(composerJsonRaw.toString());
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
        }

        return undefined;
    }

    /**
     * Try to detect OctoberCMS in project by existence of `vendor/october` directory
     * Returns only v1.0 or undefined.
     *
     * @param wsFolder
     * @returns
     */
    private tryDetectByDirectory(wsFolder: vscode.WorkspaceFolder): Version.oc10 | undefined {
        const vendorOctoberPath = WorkspacePathHelpers.rootPath(wsFolder, 'vendor/october');

        if (fs.existsSync(vendorOctoberPath)) {
            return Version.oc10;
        }

        return undefined;
    }
}
