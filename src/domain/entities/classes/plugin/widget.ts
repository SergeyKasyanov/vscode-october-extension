import { OctoberClass } from "./october-class";

/**
 * Represents generic widget class
 */
export class Widget extends OctoberClass {
    /**
     * Directory containing widgets of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['widgets'];
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
}
