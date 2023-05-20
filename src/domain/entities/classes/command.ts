import * as phpParser from 'php-parser';
import { PhpHelpers } from "../../helpers/php-helpers";
import { OctoberClass } from "./october-class";

export class Command extends OctoberClass {
    private _commandName: string = '';

    /**
     * Directory containing artisan commands of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['console'];
    }

    /**
     * Name of artisan command
     */
    get commandName(): string {
        if (!this.fileExists) {
            return this._commandName;
        }

        try {
            const properties = this.phpClassProperties;
            if (!properties) {
                return this._commandName;
            }

            if (properties.name?.value?.kind === 'string') {
                this._commandName = (properties.name.value as phpParser.String).value;
            } else if (properties.signature?.value?.kind === 'string') {
                const propVal = (properties.signature.value as phpParser.String).value;
                this._commandName = propVal.trim().split(/\r?\n/)[0].split(/\s+/)[0];
            }
        } catch (err) {
            console.error(err);
        }

        return this._commandName;
    }
}
