import * as fs from 'fs';
import { themesPath } from "../../helpers/paths";
import { readDirectoryRecursively } from "../../helpers/readDirectoryRecursively";
import { ThemeFileUtils } from "../../helpers/themeFileUtils";
import { Content } from "../../types/theme/content";
import { Layout } from "../../types/theme/layout";
import { Page } from "../../types/theme/page";
import { Partial } from "../../types/theme/partial";
import { Theme } from "../../types/theme/theme";
import path = require("path");

export class Loader {
    public loadThemes(): { [name: string]: Theme } {
        let themes: { [name: string]: Theme } = {};

        let themeDirectories = fs.readdirSync(themesPath(), { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(dir => dir.name);

        for (const themeName of themeDirectories) {
            let theme = this.makeTheme(themeName);

            themes[themeName] = theme;
        }

        return themes;
    }

    public makeTheme(themeName: string): Theme {
        let theme = new Theme(themeName);
        theme.addLayouts(this.loadLayouts(theme));
        theme.addPages(this.loadPages(theme));
        theme.addPartials(this.loadPartials(theme));
        theme.addContents(this.loadContents(theme));

        return theme;
    }

    public loadLayouts(theme: Theme): Layout[] {
        let layouts: Layout[] = [];

        const dir = themesPath(`${theme.name + path.sep}layouts`);
        if (fs.existsSync(dir)) {
            const layoutNames = readDirectoryRecursively({ dir, exts: ['.htm'] });
            for (let name of layoutNames) {
                name = name.slice(0, -4);

                const filePath = themesPath(`${theme.name + path.sep}layouts${path.sep + name}.htm`);
                const content = fs.readFileSync(filePath).toString();

                layouts.push(this.makeLayout(theme, name, content));
            }
        }

        return layouts;
    }

    public makeLayout(theme: Theme, name: string, content: string): Layout {
        return new Layout(
            theme,
            name,
            ThemeFileUtils.getIniProperties(content),
            ThemeFileUtils.getComponentsNames(content),
            ThemeFileUtils.getDefinedVars(content),
            ThemeFileUtils.getUsedPartials(content),
            ThemeFileUtils.getUsedContents(content),
            ThemeFileUtils.getPlaceholders(content),
            ThemeFileUtils.getAjaxMethods(content)
        );
    }

    public loadPages(theme: Theme): Page[] {
        let pages: Page[] = [];

        const dir = themesPath(`${theme.name + path.sep}pages`);
        if (fs.existsSync(dir)) {
            const pageNames = readDirectoryRecursively({ dir, exts: ['.htm'] });
            for (let name of pageNames) {
                name = name.slice(0, -4);

                const filePath = themesPath(`${theme.name + path.sep}pages${path.sep + name}.htm`);
                const content = fs.readFileSync(filePath).toString();

                pages.push(this.makePage(theme, name, content));
            }
        }

        return pages;
    }

    public makePage(theme: Theme, name: string, content: string): Page {
        return new Page(
            theme,
            name,
            ThemeFileUtils.getIniProperties(content),
            ThemeFileUtils.getComponentsNames(content),
            ThemeFileUtils.getDefinedVars(content),
            ThemeFileUtils.getUsedPartials(content),
            ThemeFileUtils.getUsedContents(content),
            ThemeFileUtils.getPlaceholders(content),
            ThemeFileUtils.getAjaxMethods(content)
        );
    }

    public loadPartials(theme: Theme): Partial[] {
        let partials: Partial[] = [];

        const dir = themesPath(`${theme.name + path.sep}partials`);
        if (fs.existsSync(dir)) {
            const partialNames = readDirectoryRecursively({ dir, exts: ['.htm'] });
            for (let name of partialNames) {
                name = name.slice(0, -4);

                const filePath = themesPath(`${theme.name + path.sep}partials${path.sep + name}.htm`);
                const content = fs.readFileSync(filePath).toString();

                partials.push(this.makePartial(theme, name, content));
            }
        }

        return partials;
    }

    public makePartial(theme: Theme, name: string, content: string): Partial {
        return new Partial(
            theme,
            name,
            ThemeFileUtils.getIniProperties(content),
            ThemeFileUtils.getComponentsNames(content),
            ThemeFileUtils.getDefinedVars(content),
            ThemeFileUtils.getUsedPartials(content),
            ThemeFileUtils.getUsedContents(content),
            ThemeFileUtils.getEchoedVars(content)
        );
    }

    public loadContents(theme: Theme): Content[] {
        let contents: Content[] = [];

        const dir = themesPath(`${theme.name + path.sep}content`);
        if (fs.existsSync(dir)) {
            const contentNames = readDirectoryRecursively({ dir, exts: ['.htm', '.md', '.txt'] });
            for (const name of contentNames) {
                const filePath = themesPath(`${theme.name + path.sep}content${path.sep + name}`);
                const content = fs.readFileSync(filePath).toString();

                contents.push(this.makeContent(theme, name, content));
            }
        }

        return contents;
    }

    public makeContent(theme: Theme, name: string, content: string): Content {
        return new Content(
            theme,
            name,
            ThemeFileUtils.getContentVars(content)
        );
    }
}
