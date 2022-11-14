import path = require("path");
import { OctoberClass } from "./october-class";

export class Migration extends OctoberClass {
    /**
     * Directory containing migrations of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return [path.join('database', 'migrations'), 'updates'];
    }
}
