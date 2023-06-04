import * as vscode from 'vscode';
import { FsHelpers } from "../../helpers/fs-helpers";
import { Store } from "../store";
import path = require('path');

/**
 * Indexes env variables in project
 */
export class EnvIndexer {
    constructor(
        private store: Store
    ) { }

    /**
     * Index env variables in project
     *
     * @param projectPath
     */
    index(projectPath: string): void {
        const files = FsHelpers.listFiles(projectPath, false).filter(name => name.includes('.env'));

        for (const file of files) {
            const filePath = path.join(projectPath, file);

            this.indexFile(projectPath, filePath);
        }
    }

    /**
     * Index single .env file in project
     *
     * @param projectPath
     * @param filePath
     */
    indexFile(projectPath: string, filePath: string) {
        this.deleteFile(projectPath, filePath);

        const fileContent = FsHelpers.readFile(filePath);
        const uri = vscode.Uri.file(filePath);
        const lines = fileContent.split(/\r?\n/);

        let lineNumber = -1;
        for (const line of lines) {
            lineNumber++;

            const trimmedLine = line.trim();
            if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
                continue;
            }

            const parts = trimmedLine.split('=');
            const key = parts[0].trim();
            const value = this.parseValue(parts[1]);

            this.store.addEnvVariable(projectPath, {
                key: key,
                value: value,
                location: new vscode.Location(uri, new vscode.Position(lineNumber, 0))
            });
        }
    }

    /**
     * Delete .env file from project index
     *
     * @param projectPath
     * @param filePath
     */
    deleteFile(projectPath: string, filePath: string) {
        const project = this.store.findProject(projectPath);
        if (project) {
            project!.envVariables = project!.envVariables.filter(ev => ev.location.uri.fsPath !== filePath);
        }
    }

    private parseValue(value: string | null | undefined): string | null | undefined {
        if (!value) {
            return undefined;
        }

        value = value.trim();

        if (value === 'null') {
            return null;
        }

        if (value.length === 0) {
            return undefined;
        }

        return value;
    }
}
