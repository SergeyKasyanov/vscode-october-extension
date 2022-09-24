import * as vscode from "vscode";
import { regExps } from "../../../helpers/regExps";
import { Themes } from "../../../services/themes";
import { Page } from "../../../types/theme/page";
import { HoverFactory } from "../../factories/hoverFactory";
import { LineSectionChecks } from "../../helpers/lineSectionChecks";
import path = require("path");

export class IniLayoutHoverProvider implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return;
        }

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof Page)) {
            return;
        }

        if (!LineSectionChecks.insideFileConfigSection(document, position)) {
            return;
        }

        const currentLineText = document.lineAt(position.line).text;
        const currentLineIsLayout = currentLineText.match(regExps.layoutProperty);
        if (!currentLineIsLayout) {
            return;
        }

        const thisPageLayout = currentLineIsLayout[0].split(regExps.iniPropertyDivider)[1].slice(1, -1);
        const hoveredWord = document.lineAt(position.line).text.slice(wordRange.start.character, wordRange.end.character);
        if (hoveredWord !== thisPageLayout) {
            return;
        }

        const layout = thisFile.theme.getLayout(thisPageLayout);
        if (!layout) {
            return;
        }

        return new Promise(resolve => {
            resolve(HoverFactory.fromThemeFile(layout));
        });
    }
}
