import path = require('path');
import * as phpParser from 'php-parser';
import { PhpHelpers } from "../../helpers/php-helpers";
import { Owner } from '../owners/owner';
import { HasAjaxMethods } from './concerns/has-ajax-methods';
import { OctoberClass } from "./october-class";

/**
 * Represents behavior for use in `$implement` property
 */
export abstract class Behavior extends OctoberClass {
    private _requiredProperties: string[] = [];

    /**
     * Directory containing behaviors of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['behaviors'];
    }

    /**
     * Class properties required for this behavior
     */
    get requiredProperties(): string[] {
        if (!this.fileExists) {
            this._requiredProperties = [];
            return [];
        }

        try {
            const phpClass = PhpHelpers.getClass(this.fileContent!, this.path);
            if (!phpClass) {
                this._requiredProperties = [];
                return [];
            }

            const requiredProperties: string[] = [];

            const properties = PhpHelpers.getProperties(phpClass);
            if (properties.requiredProperties && properties.requiredProperties.value?.kind === 'array') {
                for (const item of (properties.requiredProperties.value as phpParser.Array).items) {
                    requiredProperties.push(((item as phpParser.Entry).value as phpParser.String).value);
                }
            }

            this._requiredProperties = requiredProperties;
        } catch (err) {
            console.error(err);
        }

        return this._requiredProperties;
    }

    /**
     * Path to class's views and configs directory
     */
    get filesDirectory(): string {
        return path.join(this.owner.path, 'behaviors', this.uqn.toLowerCase());
    }
}

/**
 * Represents controller behavior
 */
export class ControllerBehavior extends Behavior {

    private hasAjaxMethods: HasAjaxMethods;

    constructor(
        protected _owner: Owner,
        protected _path: string,
        protected _name: string,
    ) {
        super(_owner, _path, _name);

        this.hasAjaxMethods = new HasAjaxMethods(this);
    }

    /**
     * Ajax methods of this behavior
     */
    get ajaxMethods() {
        return this.hasAjaxMethods.ajaxMethods;
    }

    /**
     * Page methods of this behavior.
     * Only for default controller behaviors
     */
    get pageMethods(): string[] {
        switch (this.fqn) {
            case 'Backend\\Behaviors\\ListController':
                return ['index'];
            case 'Backend\\Behaviors\\FormController':
                return ['create', 'update', 'preview'];
            case 'Backend\\Behaviors\\ImportExportController':
                return ['import', 'export'];
            case 'Backend\\Behaviors\\ReorderController':
                return ['reorder'];
        }

        return [];
    }

    /**
     * Name of class property with path to config
     */
    get cofigName(): string | undefined {
        switch (this.fqn) {
            case 'Backend\\Behaviors\\ListController':
                return 'listConfig';
            case 'Backend\\Behaviors\\FormController':
                return 'formConfig';
            case 'Backend\\Behaviors\\ImportExportController':
                return 'importExportConfig';
            case 'Backend\\Behaviors\\ReorderController':
                return 'reorderConfig';
            case 'Backend\\Behaviors\\RelationController':
                return 'relationConfig';
        }
    }
}

/**
 * Represents model behavior
 */
export class ModelBehavior extends Behavior {

}
