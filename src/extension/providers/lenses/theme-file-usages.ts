import * as vscode from "vscode";
import { Content } from "../../../domain/entities/theme/content";
import { Layout } from "../../../domain/entities/theme/layout";
import { Page } from "../../../domain/entities/theme/page";
import { Partial } from "../../../domain/entities/theme/partial";
import { ThemeFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import { mdSelector, octoberTplSelector, txtSelector } from "../../helpers/file-selectors";

const COMMAND_OPEN_LINKED_THEME_FILE = 'command.openLinkedThemeFile';

export function registerThemeFileLinksLensProvider(context: vscode.ExtensionContext) {
    vscode.languages.registerCodeLensProvider([octoberTplSelector, txtSelector, mdSelector], new ThemeFileUsages());

    vscode.commands.registerCommand(COMMAND_OPEN_LINKED_THEME_FILE, openLinkedFile);
}

/**
 * Lenses for layouts, pages, partials and content files in themes
 * with links to these files usages
 */
class ThemeFileUsages implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
        const themeFile = Store.instance.findEntity(document.fileName);

        let tooltip;

        if (themeFile instanceof Layout) {
            tooltip = 'Show all pages of current theme using this layout';
        } else if (themeFile instanceof Page) {
            tooltip = 'Show all files of current theme having link to this page';
        } else if (themeFile instanceof Partial) {
            tooltip = 'Show all files of current theme with this partial';
        } else if (themeFile instanceof Content) {
            tooltip = 'Show all files of current theme with this content';
        } else {
            return;
        }

        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(0, 0);
        const range = new vscode.Range(start, end);


        return [
            new vscode.CodeLens(range, {
                title: 'Find usages',
                tooltip,
                arguments: [themeFile],
                command: COMMAND_OPEN_LINKED_THEME_FILE
            })
        ];
    }
}

async function openLinkedFile(themeFile: ThemeFile) {
    const files: { [name: string]: string } = {};

    const theme = themeFile.owner;

    if (themeFile instanceof Layout) {

        // all pages uses this layout
        theme.pages
            .filter(page => page.layout?.name === themeFile.name)
            .forEach(page => files['pages/' + page.name] = page.path);

    } else if (themeFile instanceof Page) {

        // all theme files with links to this page
        theme.layouts
            .filter(tf => tf.pageLinks.includes(themeFile.name))
            .forEach(tf => files['layouts/' + tf.name] = tf.path);

        theme.pages
            .filter(tf => tf.pageLinks.includes(themeFile.name))
            .forEach(tf => files['pages/' + tf.name] = tf.path);

        theme.partials
            .filter(tf => tf.pageLinks.includes(themeFile.name))
            .forEach(tf => files['partials/' + tf.name] = tf.path);

    } else if (themeFile instanceof Partial) {

        // all theme files uses this partial
        theme.layouts
            .filter(tf => tf.partials.includes(themeFile.name))
            .forEach(tf => files['layouts/' + tf.name] = tf.path);

        theme.pages
            .filter(tf => tf.partials.includes(themeFile.name))
            .forEach(tf => files['pages/' + tf.name] = tf.path);

        theme.partials
            .filter(tf => tf.partials.includes(themeFile.name))
            .forEach(tf => files['partials/' + tf.name] = tf.path);

    } else if (themeFile instanceof Content) {

        // all theme files uses this content
        theme.layouts
            .filter(tf => tf.contents.includes(themeFile.name))
            .forEach(tf => files['layouts/' + tf.name] = tf.path);

        theme.pages
            .filter(tf => tf.contents.includes(themeFile.name))
            .forEach(tf => files['pages/' + tf.name] = tf.path);

        theme.partials
            .filter(tf => tf.contents.includes(themeFile.name))
            .forEach(tf => files['partials/' + tf.name] = tf.path);

    } else {
        return;
    }

    if (Object.keys(files).length === 0) {
        vscode.window.showInformationMessage('Usages not found');
        return;
    }

    const fileToOpen = Object.keys(files).length === 1
        ? Object.values(files)[0]
        : await vscode.window.showQuickPick(Object.keys(files), { title: 'Choose file to open' });

    if (fileToOpen === undefined) {
        return;
    }

    const uri = vscode.Uri.file(files[fileToOpen]);

    vscode.window.showTextDocument(uri);
}
