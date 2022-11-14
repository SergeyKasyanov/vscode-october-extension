import * as vscode from 'vscode';
import * as path from 'path';
import { Config } from '../../config';

/**
 * Helpers for generate workspace related files paths
 */
export class WorkspacePathHelpers {
    /**
     * Generate path related to workspace root
     *
     * @param wsFolder
     * @param location
     * @returns
     */
    static rootPath(wsFolder: vscode.WorkspaceFolder, location: string = ''): string {
        return path.join(wsFolder.uri.path, location);
    }

    /**
     * Generate path related to app directory of workspace
     *
     * @param wsFolder
     * @param location
     * @returns
     */
    static appPath(wsFolder: vscode.WorkspaceFolder, location: string = ''): string {
        return path.join(wsFolder.uri.path, 'app', location);
    }

    /**
     * Generate path related to plugins directory of workspace
     *
     * @param wsFolder
     * @param location
     * @returns
     */
    static pluginsPath(wsFolder: vscode.WorkspaceFolder, location: string = ''): string {
        return path.join(wsFolder.uri.path, Config.pluginsDirectory, location);
    }

    /**
     * Generate path related to themes directory of workspace
     *
     * @param wsFolder
     * @param location
     * @returns
     */
    static themesPath(wsFolder: vscode.WorkspaceFolder, location: string = ''): string {
        return path.join(wsFolder.uri.path, Config.themesDirectory, location);
    }

    /**
     * Generate path related to modules directory of workspace
     *
     * @param wsFolder
     * @param location
     * @returns
     */
    static modulesPath(wsFolder: vscode.WorkspaceFolder, location: string = ''): string {
        return path.join(wsFolder.uri.path, 'modules', location);
    }
}
