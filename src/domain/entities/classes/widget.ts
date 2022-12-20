import path = require("path");
import { Owner } from "../owners/owner";
import { HasAjaxMethods } from "./concerns/has-ajax-methods";
import { OctoberClass } from "./october-class";

/**
 * Represents generic widget class
 */
export class Widget extends OctoberClass {

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
     * Directory containing widgets of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['widgets'];
    }

    /**
     * Ajax methods of this widget
     */
    get ajaxMethods() {
        return this.hasAjaxMethods.ajaxMethods;
    }

    /**
     * Path to class's views and configs directory
     */
    get filesDirectory(): string {
        return path.join(this.owner.path, 'widgets', this.uqn.toLowerCase());
    }
}

/**
 * Represents form widget class
 */
export class FormWidget extends Widget {
    /**
     * Directory containing form widgets of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['formwidgets'];
    }

    /**
     * Path to class's views and configs directory
     */
    get filesDirectory(): string {
        return path.join(this.owner.path, 'formwidgets', this.uqn.toLowerCase());
    }
}

/**
 * Represents report widget class
 */
export class ReportWidget extends Widget {
    /**
     * Directory containing report widgets of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['reportwidgets'];
    }

    /**
     * Path to class's views and configs directory
     */
    get filesDirectory(): string {
        return path.join(this.owner.path, 'reportwidgets', this.uqn.toLowerCase());
    }
}

/**
 * Represents filter widget class
 */
export class FilterWidget extends Widget {
    /**
     * Directory containing filter widgets of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['filterwidgets'];
    }

    /**
     * Path to class's views and configs directory
     */
    get filesDirectory(): string {
        return path.join(this.owner.path, 'filterwidgets', this.uqn.toLowerCase());
    }
}
