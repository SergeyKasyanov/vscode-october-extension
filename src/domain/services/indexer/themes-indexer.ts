import path = require('path');
import { Config } from '../../../config';
import { Theme } from '../../entities/owners/theme';
import { Content } from '../../entities/theme/content';
import { Layout } from '../../entities/theme/layout';
import { Page } from '../../entities/theme/page';
import { Partial } from '../../entities/theme/partial';
import { ThemeFile } from '../../entities/theme/theme-file';
import { FsHelpers } from '../../helpers/fs-helpers';
import { PathHelpers } from '../../helpers/path-helpers';
import { Store } from "../store";

/**
 * Indexes themes files
 */
export class ThemesIndexer {
    private projectPath: string | undefined;

    constructor(
        private store: Store
    ) { }

    /**
     * Index project themes
     *
     * @param projectPath
     */
    index(projectPath: string) {
        this.projectPath = projectPath;

        for (const theme of this.listThemes()) {
            this.indexTheme(theme);
            this.store.addTheme(this.projectPath!, theme);
        }
    }

    /**
     * Index single file in project
     *
     * @param projectPath
     * @param filePath
     * @returns
     */
    indexFile(projectPath: string, filePath: string) {
        const project = this.store.findProject(filePath);
        if (!project) {
            return;
        }

        const nameParts = filePath
            .replace(projectPath, '')
            .substring(1)
            .split(path.sep);

        const ownerType = nameParts.shift();
        if (ownerType !== Config.themesDirectory) {
            return;
        }

        const themeName = nameParts.shift();
        if (!themeName) {
            return;
        }

        let theme = project.themes.find(t => t.name === themeName);
        if (!theme) {
            theme = new Theme(themeName, path.join(projectPath, Config.themesDirectory, themeName));
            this.indexTheme(theme);
            this.store.addTheme(projectPath, theme);
            return;
        }

        const dir = nameParts.shift();
        if (!dir) {
            return;
        }

        if (Layout.getBaseDirectories().includes(dir)) {
            const exists = theme.hasOwnLayout(filePath);
            if (exists) { return; }

            let themeFileName = filePath.replace(path.join(theme.path, 'layouts'), '');
            if (themeFileName.startsWith(path.sep)) {
                themeFileName = themeFileName.substring(1);
            }
            themeFileName = themeFileName.substring(0, themeFileName.length - 4).replace(path.sep, '/');

            const themeFile = new Layout(theme, filePath, themeFileName);
            theme.addLayout(themeFile);

        } else if (Page.getBaseDirectories().includes(dir)) {
            const exists = theme.hasOwnPage(filePath);
            if (exists) { return; }

            let themeFileName = filePath.replace(path.join(theme.path, 'pages'), '');
            if (themeFileName.startsWith(path.sep)) {
                themeFileName = themeFileName.substring(1);
            }
            themeFileName = themeFileName.substring(0, themeFileName.length - 4).replace(path.sep, '/');

            const themeFile = new Page(theme, filePath, themeFileName);
            theme.addPage(themeFile);

        } else if (Partial.getBaseDirectories().includes(dir)) {
            const exists = theme.hasOwnPartial(filePath);
            if (exists) { return; }

            let themeFileName = filePath.replace(path.join(theme.path, 'partials'), '');
            if (themeFileName.startsWith(path.sep)) {
                themeFileName = themeFileName.substring(1);
            }
            themeFileName = themeFileName.substring(0, themeFileName.length - 4).replace(path.sep, '/');

            const themeFile = new Partial(theme, filePath, themeFileName);
            theme.addPartial(themeFile);

        } else if (Content.getBaseDirectories().includes(dir)) {
            const exists = theme.hasOwnContent(filePath);
            if (exists) { return; }

            let themeFileName = filePath.replace(path.join(theme.path, 'content'), '');
            if (themeFileName.startsWith(path.sep)) {
                themeFileName = themeFileName.substring(1);
            }
            themeFileName = themeFileName.replace(path.sep, '/');

            const themeFile = new Content(theme, filePath, themeFileName);
            theme.addContent(themeFile);
        }
    }

    /**
     * Delete file from Store
     *
     * @param projectPath
     * @param filePath
     */
    deleteFile(projectPath: string, filePath: string) {
        const themeFile = this.store.findEntity(filePath);
        if (!(themeFile instanceof ThemeFile)) {
            return;
        }

        if (themeFile instanceof Layout) {
            themeFile.owner.deleteLayout(themeFile);
        } else if (themeFile instanceof Page) {
            themeFile.owner.deletePage(themeFile);
        } else if (themeFile instanceof Partial) {
            themeFile.owner.deletePartial(themeFile);
        } else if (themeFile instanceof Content) {
            themeFile.owner.deleteContent(themeFile);
        }
    }

    /**
     * List themes of project
     *
     * @returns
     */
    private listThemes(): Theme[] {
        return FsHelpers
            .listDirectories(PathHelpers.themesPath(this.projectPath!))
            .map(entry => {
                const themePath = PathHelpers.themesPath(this.projectPath!, entry);
                return new Theme(entry, themePath);
            });
    }

    /**
     * Load data from theme
     *
     * @param theme
     */
    private indexTheme(theme: Theme): void {
        try { this.loadLayouts(theme); } catch (err) { console.debug(err); }
        try { this.loadPages(theme); } catch (err) { console.debug(err); }
        try { this.loadPartials(theme); } catch (err) { console.debug(err); }
        try { this.loadContents(theme); } catch (err) { console.debug(err); }
    }

    /**
     * Load layouts of theme
     *
     * @param theme
     */
    private loadLayouts(theme: Theme) {
        const layouts: Layout[] = [];

        for (const dir of Layout.getBaseDirectories()) {
            const directory = path.join(theme.path, dir);
            if (FsHelpers.exists(directory)) {
                FsHelpers
                    .listFiles(directory, true)
                    .map(filepath => layouts.push(new Layout(
                        theme,
                        path.join(theme.path, dir, filepath),
                        filepath.substring(0, filepath.length - 4).replace(path.sep, '/')
                    )));
            }
        }

        theme.replaceLayouts(layouts);
    }

    /**
     * Load pages of theme
     *
     * @param theme
     */
    private loadPages(theme: Theme) {
        const pages: Page[] = [];

        for (const dir of Page.getBaseDirectories()) {
            const directory = path.join(theme.path, dir);
            if (FsHelpers.exists(directory)) {
                FsHelpers
                    .listFiles(directory, true)
                    .map(filepath => pages.push(new Page(
                        theme,
                        path.join(theme.path, dir, filepath),
                        filepath.substring(0, filepath.length - 4).replace(path.sep, '/')
                    )));
            }
        }

        theme.replacePages(pages);
    }

    /**
     * Load partials of theme
     *
     * @param theme
     */
    private loadPartials(theme: Theme) {
        const partials: Partial[] = [];

        for (const dir of Partial.getBaseDirectories()) {
            const directory = path.join(theme.path, dir);
            if (FsHelpers.exists(directory)) {
                FsHelpers
                    .listFiles(directory, true)
                    .map(filepath => partials.push(new Partial(
                        theme,
                        path.join(theme.path, dir, filepath),
                        filepath.substring(0, filepath.length - 4).replace(path.sep, '/')
                    )));
            }
        }

        theme.replacePartials(partials);
    }

    /**
     * Load contents of theme
     *
     * @param theme
     */
    private loadContents(theme: Theme) {
        const contents: Content[] = [];

        for (const dir of Content.getBaseDirectories()) {
            const directory = path.join(theme.path, dir);
            if (FsHelpers.exists(directory)) {
                FsHelpers
                    .listFiles(directory, true)
                    .map(filepath => contents.push(new Content(
                        theme,
                        path.join(theme.path, dir, filepath),
                        filepath.replace(path.sep, '/')
                    )));
            }
        }

        theme.replaceContents(contents);
    }
}
