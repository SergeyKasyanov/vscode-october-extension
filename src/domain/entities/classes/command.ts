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
            const phpClass = PhpHelpers.getClass(this.fileContent!, this.path);
            if (!phpClass) {
                return this._commandName;
            }

            const properties = PhpHelpers.getProperties(phpClass);
            if (properties.name?.value?.kind !== 'string') {
                return this._commandName;
            }

            this._commandName = (properties.name.value as phpParser.String).value;
        } catch (err) {
            console.error(err);
        }

        return this._commandName;
    }
}
