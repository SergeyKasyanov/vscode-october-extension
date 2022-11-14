export abstract class ThemeFile {
    /**
     * Theme directory for this kind of theme files
     */
    static getBaseDirectories(): string[] {
        throw Error();
    }
}
