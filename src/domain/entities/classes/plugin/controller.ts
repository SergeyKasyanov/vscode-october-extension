import { OctoberClass } from "./october-class";

/**
 * Represents controller class in plugin, module or app
 */
export class Controller extends OctoberClass {
    /**
     * Directory containing controllers of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['controllers'];
    }
}
