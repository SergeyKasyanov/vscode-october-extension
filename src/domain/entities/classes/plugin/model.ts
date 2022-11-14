import { OctoberClass } from "./october-class";

/**
 * Represents model class in plugin, module or app
 */
export class Model extends OctoberClass {
    /**
     * Directory containing models of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['models'];
    }
}
