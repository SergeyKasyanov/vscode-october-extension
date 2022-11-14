import { ThemeFile } from "./theme-file";

/**
 * Represents layout of theme in project
 */
export class Layout extends ThemeFile {
    /**
     * Theme directory containing layouts
     */
    static getBaseDirectories(): string[] {
        return ['layouts'];
    }
}
