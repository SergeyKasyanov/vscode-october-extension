import { OctoberClass } from "./october-class";

/**
 * Represents behavior for use in `$implement` property
 */
export abstract class Behavior extends OctoberClass {
    requiredProperties: string[] = [];

    /**
     * Directory containing behaviors of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['behaviors'];
    }
}

/**
 * Represents controller behavior
 */
export class ControllerBehavior extends Behavior {

}

/**
 * Represents model behavior
 */
export class ModelBehavior extends Behavior {

}
