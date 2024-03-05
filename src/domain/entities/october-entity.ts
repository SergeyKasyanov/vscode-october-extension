import * as vscode from 'vscode';
import { MethodCalledFromBaseClass } from "../errors/method-called-from-base-class";
import { FsHelpers } from "../helpers/fs-helpers";
import { Owner } from "./owners/owner";
import path = require('path');

/**
 * Base class for all project's classes and theme objects
 */
export abstract class OctoberEntity {
    constructor(
        protected _owner: Owner,
        protected _path: string,
        protected _name: string,
    ) { }

    /**
     * Plugin/module/theme directory for this kind of classes
     */
    static getBaseDirectories(): string[] {
        throw new MethodCalledFromBaseClass();
    }

    /**
     * Entity owner (app/module/plugin/theme)
     */
    get owner(): Owner {
        return this._owner;
    }

    /**
     * Path to file
     */
    get path(): string {
        return this._path;
    }

    /**
     * Filename without path
     */
    get filename(): string {
        return this._path.split(path.sep).pop()!;
    }

    /**
     * Uri to file
     */
    get uri(): vscode.Uri {
        return vscode.Uri.file(this.path);
    }

    /**
     * Path relative to owner
     */
    get relativePath(): string {
        return this._path.replace(this.owner.path, '').substring(1);
    }

    /**
     * Full name of entity
     */
    get name(): string {
        return this._name;
    }

    /**
     * Is file with entity still exists?
     */
    get fileExists(): boolean {
        return FsHelpers.exists(this.path);
    }

    /**
     * Content of file with entity
     */
    get fileContent(): string | undefined {
        // if file is opened - get text from editor
        for (const editor of vscode.window.visibleTextEditors) {
            if (editor.document.fileName === this.path) {
                return editor.document.getText();
            }
        }

        if (this.fileExists) {
            return FsHelpers.readFile(this.path);
        }
    }
}
