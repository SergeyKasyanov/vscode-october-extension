import { Content } from "../theme/content";
import { Layout } from "../theme/layout";
import { Page } from "../theme/page";
import { Partial } from "../theme/partial";
import { ThemeFile } from "../theme/theme-file";
import { Owner } from "./owner";
import path = require("path");
import yaml = require("yaml");

/**
 * Represents theme of opened project
 */
export class Theme extends Owner {
    private _layouts: Layout[] = [];
    private _pages: Page[] = [];
    private _partials: Partial[] = [];
    private _contents: Content[] = [];

    /**
     * Path to theme.yaml of this theme
     */
    get registrationFilePath(): string {
        return path.join(this.path, 'theme.yaml');
    }

    /**
     * Parent theme for current theme
     */
    get parentTheme(): Theme | undefined {
        const registrationFileContent = this.registrationFileContent;
        if (!registrationFileContent) {
            return;
        }

        const themeConfig = yaml.parse(registrationFileContent);
        const parentThemeName = themeConfig.parent;
        if (!parentThemeName) {
            return;
        }

        return this.project.themes.find(t => t.name === parentThemeName);
    }

    /**
     * Children themes of current theme
     */
    get childrenThemes(): Theme[] {
        return this.project.themes.reduce<Theme[]>((acc, theme) => {
            if (theme.parentTheme?.name === this.name) {
                acc.push(theme, ...theme.childrenThemes);
            }

            return acc;
        }, []);
    }

    /**
     * Layouts registered in theme
     */
    get layouts(): Layout[] {
        const parentTheme = this.parentTheme;

        if (parentTheme) {
            return [
                ...this._layouts,
                ...parentTheme.layouts
            ];
        }

        return this._layouts;
    }

    /**
     * Pages registered in theme
     */
    get pages(): Page[] {
        const parentTheme = this.parentTheme;

        if (parentTheme) {
            return [
                ...this._pages,
                ...parentTheme.pages
            ];
        }

        return this._pages;
    }

    /**
     * Partials registered in theme
     */
    get partials(): Partial[] {
        const parentTheme = this.parentTheme;

        if (parentTheme) {
            return [
                ...this._partials,
                ...parentTheme.partials
            ];
        }

        return this._partials;
    }

    /**
     * Content files registered in theme
     */
    get contents(): Content[] {
        const parentTheme = this.parentTheme;

        if (parentTheme) {
            return [
                ...this._contents,
                ...parentTheme.contents
            ];
        }

        return this._contents;
    }

    //
    // Layouts
    //

    /**
     * Add layout to index
     *
     * @param layout
     */
    addLayout(layout: Layout) {
        this._layouts.push(layout);
    }

    /**
     * Delete layout from index
     *
     * @param layout
     */
    deleteLayout(layout: Layout) {
        this._layouts = this._layouts.filter(tf => tf.path !== layout.path);
    }

    /**
     * Replace loaded layouts
     *
     * @param layouts
     */
    replaceLayouts(layouts: Layout[]) {
        this._layouts = layouts;
    }

    /**
     * Determine if theme has layout by file path
     *
     * @param filePath
     * @returns
     */
    hasOwnLayout(filePath: string) {
        return this._layouts.find(l => l.path === filePath);
    }

    //
    // Pages
    //

    /**
     * Add page to index
     *
     * @param page
     */
    addPage(page: Page) {
        this._pages.push(page);
    }

    /**
     * Delete page from index
     *
     * @param page
     */
    deletePage(page: Page) {
        this._pages = this._pages.filter(tf => tf.path !== page.path);
    }

    /**
     * Replace loaded pages
     *
     * @param pages
     */
    replacePages(pages: Page[]) {
        this._pages = pages;
    }

    /**
     * Determine if theme has page by file path
     *
     * @param filePath
     * @returns
     */
    hasOwnPage(filePath: string) {
        return this._pages.find(p => p.path === filePath);
    }

    //
    // Partials
    //

    /**
     * Add partial to index
     *
     * @param partial
     */
    addPartial(partial: Partial) {
        this._partials.push(partial);
    }

    /**
     * Delete partial from index
     *
     * @param partial
     */
    deletePartial(partial: Partial) {
        this._partials = this._partials.filter(tf => tf.path !== partial.path);
    }

    /**
     * Replace loaded partials
     *
     * @param partials
     */
    replacePartials(partials: Partial[]) {
        this._partials = partials;
    }

    /**
     * Determine if theme has partial by file path
     *
     * @param filePath
     * @returns
     */
    hasOwnPartial(filePath: string) {
        return this._partials.find(p => p.path === filePath);
    }

    //
    // Content
    //

    /**
     * Add content to index
     *
     * @param content
     */
    addContent(content: Content) {
        this._contents.push(content);
    }

    /**
     * Delete content from index
     *
     * @param content
     */
    deleteContent(content: Content) {
        this._contents = this._contents.filter(tf => tf.path !== content.path);
    }

    /**
     * Replace loaded contents
     *
     * @param contents
     */
    replaceContents(contents: Content[]) {
        this._contents = contents;
    }

    /**
     * Determine if theme has content by file path
     *
     * @param filePath
     * @returns
     */
    hasOwnContent(filePath: string) {
        return this._contents.find(p => p.path === filePath);
    }

    /**
     * File theme file by it's path
     *
     * @param filePath
     */
    findEntityByPath(filePath: string): ThemeFile | undefined {
        return this.layouts.find(e => e.path === filePath)
            || this.pages.find(e => e.path === filePath)
            || this.partials.find(e => e.path === filePath)
            || this.contents.find(e => e.path === filePath);
    }
}
