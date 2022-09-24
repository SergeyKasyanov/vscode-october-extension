import * as vscode from "vscode";
import { regExps } from "../../../helpers/regExps";
import { Themes } from "../../../services/themes";
import { ThemeMarkupFile } from "../../../types/theme/themeFile";
import { HoverFactory } from "../../factories/hoverFactory";

export class TwigPageHoverProvider implements vscode.HoverProvider {
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position, regExps.pageFilteredString);
        if (!wordRange) {
            return;
        }

        const quotedPageName = document.lineAt(position.line).text.slice(wordRange.start.character, wordRange.end.character).match(regExps.pageName);
        if (!quotedPageName) {
            return;
        }

        const pageName = quotedPageName[0].slice(1, -1);
        if (!pageName) {
            return;
        }

        const page = thisFile.theme.getPage(pageName);
        if (!page) {
            return;
        }

        return new Promise(resolve => {
            resolve(HoverFactory.fromThemeFile(page));
        });
    }
}
