import * as vscode from 'vscode';
import { Config } from '../../config';
import { Platform } from '../entities/platform';
import { VersionDetector } from './version-detector';

interface WorkspaceData {
    platform: Platform,
    // modules:
}

export class Indexer {
    private versionDetector: VersionDetector;
    private data: { [workspacePath: string]: WorkspaceData } = {};

    constructor() {
        this.versionDetector = new VersionDetector();
    }

    /**
     * Index workspace
     *
     * @param wsFolder
     * @returns
     */
    index(wsFolder: vscode.WorkspaceFolder) {
        try {
            const version = this.versionDetector.detect(wsFolder);
            if (!version) {
                return;
            }

            const platform = new Platform(version);

            let directoriesForIndex = [
                'modules',
                Config.pluginsDirectory,
                Config.themesDirectory,
            ];

            if (platform.hasAppDirectory) {
                directoriesForIndex.push('app');
            }

            for (const dir of directoriesForIndex) {
                this.indexDirectory(wsFolder, dir);
            }

        } catch (err) {
            console.error(err);
            return;
        }
    }

    private indexDirectory(wsFolder: vscode.WorkspaceFolder, dir: string) {

    }
}
