import * as vscode from "vscode";
import { mdSelector, octoberTplSelector, txtSelector } from "../../../helpers/fileSelectors";
import { themesPath } from "../../../helpers/paths";
import { Themes } from "../../../services/themes";
import { Content } from "../../../types/theme/content";
import { Layout } from "../../../types/theme/layout";
import { Page } from "../../../types/theme/page";
import { Partial } from "../../../types/theme/partial";
import { ThemeFile } from "../../../types/theme/themeFile";

const COMMAND_OPEN_LINKED_THEME_FILE = 'command.openLinkedThemeFile';

export function registerThemeFileLinksLensProvider(context: vscode.ExtensionContext) {
    vscode.languages.registerCodeLensProvider([octoberTplSelector, txtSelector, mdSelector], new ThemeFileLinksLensProvider());

    vscode.commands.registerCommand(COMMAND_OPEN_LINKED_THEME_FILE, openLinkedFile);
}

class ThemeFileLinksLensProvider implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        if (!Themes.instance.isThemeFile(document.fileName)) {
            return;
        }

        const themeFile = Themes.instance.getFileByPath(document.fileName);
        if (themeFile instanceof Layout || themeFile instanceof Partial || themeFile instanceof Content) {
            return [
                new vscode.CodeLens(new vscode.Range(
                    new vscode.Position(0, 0),
                    new vscode.Position(0, 0)
                ))
            ];
        }
    }

    resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        const document = vscode.window.activeTextEditor?.document;
        if (!document) {
            return;
        }

        const themeFile = Themes.instance.getFileByPath(document.fileName);
        const theme = themeFile?.theme;
        if (!theme) {
            return;
        }

        let title, tooltip;

        if (themeFile instanceof Layout) {
            tooltip = 'Show all pages of current theme using this layout';
        } else if (themeFile instanceof Partial) {
            tooltip = 'Show all files of current theme with this partial';
        } else if (themeFile instanceof Content) {
            tooltip = 'Show all files of current theme with this content';
        } else {
            return;
        }

        codeLens.command = {
            title: 'Find usages',
            tooltip,
            arguments: [themeFile],
            command: COMMAND_OPEN_LINKED_THEME_FILE
        };

        return codeLens;
    }

}

async function openLinkedFile(themeFile: ThemeFile) {
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        return;
    }

    const theme = themeFile.theme;
    let files: { [name: string]: string } = {};

    if (themeFile instanceof Layout) {
        Object.values(theme.pages)
            .filter(page => page.layoutName === themeFile.name)
            .forEach(page => {
                files['pages/' + page.name] = page.filepath;
            });
    } else if (themeFile instanceof Partial) {
        Object.values(theme.layouts)
            .filter(layout => layout.partials.includes(themeFile.name))
            .forEach(layout => {
                files['layouts/' + layout.name] = layout.filepath;
            });

        Object.values(theme.pages)
            .filter(page => page.partials.includes(themeFile.name))
            .forEach(page => {
                files['pages/' + page.name] = page.filepath;
            });

        Object.values(theme.partials)
            .filter(partial => partial.partials.includes(themeFile.name))
            .forEach(partial => {
                files['partials/' + partial.name] = partial.filepath;
            });
    } else if (themeFile instanceof Content) {
        let name = themeFile.name;

        const hasExt = name.endsWith('.htm') || name.endsWith('.md') || name.endsWith('.txt');
        if (!hasExt) {
            name += '.htm';
        }

        Object.values(theme.layouts)
            .filter(layout => layout.contents.includes(name))
            .forEach(layout => {
                files['layouts/' + layout.name] = layout.filepath;
            });

        Object.values(theme.pages)
            .filter(page => page.contents.includes(name))
            .forEach(page => {
                files['pages/' + page.name] = page.filepath;
            });

        Object.values(theme.partials)
            .filter(partial => partial.contents.includes(name))
            .forEach(partial => {
                files['partials/' + partial.name] = partial.filepath;
            });
    } else {
        return;
    }

    if (Object.keys(files).length === 0) {
        vscode.window.showInformationMessage('Theme is no such files');
        return;
    }

    const fileToOpen = await vscode.window.showQuickPick(Object.keys(files), { title: 'Choose file to open' });
    if (fileToOpen === undefined) {
        return;
    }

    vscode.window.showTextDocument(vscode.Uri.file(themesPath(files[fileToOpen])));
}
