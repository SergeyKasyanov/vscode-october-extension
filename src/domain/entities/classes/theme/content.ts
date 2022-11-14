import { ThemeFile } from "./theme-file";

/**
 * Represents content of theme in project
 */
export class Content extends ThemeFile {
    /**
     * Theme directory containing contents
     */
    static getBaseDirectories(): string[] {
        return ['content'];
    }
}
