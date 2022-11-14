import { ThemeFile } from "./theme-file";

/**
 * Represents partial of theme in project
 */
export class Partial extends ThemeFile {
    /**
     * Theme directory containing partials
     */
    static getBaseDirectories(): string[] {
        return ['partials'];
    }
}
