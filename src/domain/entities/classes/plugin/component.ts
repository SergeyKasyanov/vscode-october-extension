import { OctoberClass } from "./october-class";

/**
 * Represents front-end component class
 */
export class Component extends OctoberClass {
    /**
     * Directory containing components of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['components'];
    }
}
