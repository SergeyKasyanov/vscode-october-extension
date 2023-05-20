import * as vscode from 'vscode';
import { FsHelpers } from "../../helpers/fs-helpers";
import { Store } from "../../services/store";
import { OctoberEntity } from "../october-entity";
import { Project } from '../project';

/**
 * Base class for different file owners.
 * It may be module, plugin, theme, or app directory
 */
export abstract class Owner {
    constructor(
        protected _name: string,
        protected _path: string
    ) { }

    /**
     * Returns owner type
     */
    get ownerType() {
        return this.constructor.name;
    }

    /**
     * Workspace folder of this owner
     */
    get project(): Project {
        return Store.instance.findProject(this.path)!;
    }

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

    /**
     * Is owner's registration file exists
     */
    get registrationFileExists(): boolean {
        return FsHelpers.exists(this.registrationFilePath);
    }

    /**
     * Content of owner's registration file as string
     */
    get registrationFileContent(): string | undefined {
        // if file is opened - get text from editor
        for (const editor of vscode.window.visibleTextEditors) {
            if (editor.document.fileName === this.registrationFilePath) {
                return editor.document.getText();
            }
        }

        if (this.registrationFileExists) {
            return FsHelpers.readFile(this.registrationFilePath);
        }
    }

    /**
     * Path to owner's registration file
     */
    abstract get registrationFilePath(): string;

    /**
     * Find october entity by file path
     *
     * @param filePath
     * @returns
     */
    abstract findEntityByPath(filePath: string): OctoberEntity | undefined;
}
