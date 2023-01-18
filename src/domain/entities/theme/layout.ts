import * as vscode from "vscode";
import { MarkupFile, ThemeFileType } from "./theme-file";

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
     * Entity type
     */
    get type(): ThemeFileType {
        return 'layout';
    }

    /**
     * Finds usages of this layout
     */
    async findReferences(): Promise<vscode.Location[]> {
        const locations: vscode.Location[] = [];

        const pages = this.owner.pages;

        this.owner.childrenThemes.forEach(child => {
            pages.push(...child.pages);
        });

        const processedFiles: string[] = [];
        for (const page of pages) {
            if (processedFiles.includes(page.path)) {
                continue;
            }

            if (page.layout?.name === this.name) {
                const pageDoc = await vscode.workspace.openTextDocument(vscode.Uri.file(page.path));

                const range = new vscode.Range(
                    pageDoc.positionAt(page.layoutOffset!.start),
                    pageDoc.positionAt(page.layoutOffset!.end)
                );

                const location = new vscode.Location(vscode.Uri.file(page.path), range);
                locations.push(location);
            }

            processedFiles.push(page.path);
        }

        return locations;
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

        const placeholderTagsMatches = sections.twig.text.matchAll(PLACEHOLDER_TAGS);
        for (const match of placeholderTagsMatches) {
            const placeholder = match[0].replace(PLACEHOLDER_TAG_START, '').trim();
            placeholders.push(placeholder);
        }

        const placeholderVarsMatches = sections.twig.text.matchAll(PLACEHOLDER_VARS);
        for (const match of placeholderVarsMatches) {
            const placeholder = match[0].replace(PLACEHOLDER_VAR_START, '').trim().slice(0, -1);
            placeholders.push(placeholder);
        }

        return placeholders;
    }
}
