import * as vscode from "vscode";
import { regExps } from "../../../helpers/regExps";
import { Themes } from "../../../services/themes";
import { ThemeMarkupFile } from "../../../types/theme/themeFile";
import { HoverFactory } from "../../factories/hoverFactory";

export class TwigPartialHoverProvider implements vscode.HoverProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        this.document = document;
        this.position = position;

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position, regExps.partialName);
        if (!wordRange) {
            return;
        }

        if (!(this.isPartialTag(wordRange) || this.isPartialFunction(wordRange))) {
            return;
        }

        const partialName = document
            .lineAt(position.line)
            .text
            .slice(wordRange.start.character + 1, wordRange.end.character - 1);

        if (!partialName) {
            return;
        }

        const partial = thisFile.theme.getPartial(partialName);
        if (!partial) {
            return;
        }

        return new Promise(resolve => {
            resolve(HoverFactory.fromThemeFile(partial));
        });
    }

    private isPartialTag(hoveredWordRange: vscode.Range): boolean {
        const partialTagRange = this.document!.getWordRangeAtPosition(this.position!, regExps.partialTag);
        if (!partialTagRange) {
            return false;
        }

        return partialTagRange.end.isEqual(hoveredWordRange.end);
    }

    private isPartialFunction(hoveredWordRange: vscode.Range): boolean {
        const partialFunctionRange = this.document!.getWordRangeAtPosition(this.position!, regExps.partialFunction);
        if (!partialFunctionRange) {
            return false;
        }

        return partialFunctionRange.end.isEqual(hoveredWordRange.end);
    }
}
