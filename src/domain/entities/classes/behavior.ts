/**
 * Represents behavior for use in `$implement` property
 */
export abstract class Behavior {
    constructor(private _requiredProperties: string[]) { }

    /**
     * Required properties for behavior
     */
    get requiredProperties(): string[] {
        return this._requiredProperties;
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
