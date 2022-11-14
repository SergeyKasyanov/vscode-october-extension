import { ThemeFile } from "./theme-file";

/**
 * Represents page of theme in project
 */
export class Page extends ThemeFile {
    /**
     * Theme directory containing pages
     */
    static getBaseDirectories(): string[] {
        return ['pages'];
    }
}
