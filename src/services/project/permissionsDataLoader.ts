import path = require("path");
import * as vscode from "vscode";
import { hideTailorPermissions } from "../../config";
import { pluginsPath } from "../../helpers/paths";
import { Permission } from "../../types/plugin/permission";
import { PhpDataLoader } from "./base/phpDataLoader";
import phpCode from './php/permissionsLoaderCode';

export class PermissionsDataLoader extends PhpDataLoader {

    private static instance: PermissionsDataLoader;

    public static getInstance(): PermissionsDataLoader {
        if (!this.instance) {
            this.instance = new PermissionsDataLoader();
        }

        return this.instance;
    }

    protected getPhpScript(): string {
        return phpCode;
    }

    protected processData(data: any): void {
        let records: { [code: string]: Permission } = {};
        const hideTailor = hideTailorPermissions();

        for (const elem of data) {
            if (elem.code.startsWith('tailor') && hideTailor) {
                continue;
            }

            const record: Permission = {
                label: elem.label,
                code: elem.code,
                plugin: elem.owner,
                comment: elem.comment,
            };

            records[elem.code] = record;
        }

        this._data = records;
    }

    protected getWatcherPathPattern(): vscode.GlobPattern {
        return new vscode.RelativePattern(pluginsPath(), "**" + path.sep + "Plugin.php");
    }
}
