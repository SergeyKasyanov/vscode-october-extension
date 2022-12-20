import { MarkupFile } from "./theme-file";

const PLACEHOLDER_TAGS = /\{\%\s*placeholder\s+\w+/g;
const PLACEHOLDER_TAG_START = /\{\%\s*placeholder\s+/;
const PLACEHOLDER_VARS = /=\s*placeholder\([\'\"]\w+[\'\"]/g;
const PLACEHOLDER_VAR_START = /=\s*placeholder\([\'\"]/;

/**
 * Represents layout of theme in project
 */
export class Layout extends MarkupFile {
    /**
     * Theme directory containing layouts
     */
    static getBaseDirectories(): string[] {
        return ['layouts'];
    }

    /**
     * Placeholders defined in layout
     */
    get placeholders(): string[] {
        if (!this.fileContent) {
            return [];
        }

        const sections = this.sections;
        const placeholders: string[] = [];

        const placeholderTagsMatches = sections.twig.matchAll(PLACEHOLDER_TAGS);
        for (const match of placeholderTagsMatches) {
            const placeholder = match[0].replace(PLACEHOLDER_TAG_START, '').trim();
            placeholders.push(placeholder);
        }

        const placeholderVarsMatches = sections.twig.matchAll(PLACEHOLDER_VARS);
        for (const match of placeholderVarsMatches) {
            const placeholder = match[0].replace(PLACEHOLDER_VAR_START, '').trim().slice(0, -1);
            placeholders.push(placeholder);
        }

        return placeholders;
    }
}
