import * as vscode from "vscode";
import { Project } from "../../../services/project";
import { HoverFactory } from "../../factories/hoverFactory";
import { isRightAfter } from "../../helpers/isRightAfter";
import { LineSectionChecks } from "../../helpers/lineSectionChecks";
import { regExps } from "../../../helpers/regExps";
import { Themes } from "../../../services/themes";
import { ThemeFile, ThemeMarkupFile } from "../../../types/theme/themeFile";
import { ThemeFileUtils } from "../../../helpers/themeFileUtils";

export class TwigEchoHoverProvider implements vscode.HoverProvider {

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

        if (!LineSectionChecks.insideTwigSection(document, position)) {
            return;
        }

        const insideTwigStatement = document.getWordRangeAtPosition(position, regExps.twigStatement);
        if (!insideTwigStatement) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return;
        }

        if (this.isTwigTag(wordRange) || this.isFilter(wordRange)) {
            return;
        }

        const word = document.lineAt(position.line).text.slice(wordRange.start.character, wordRange.end.character);

        const func = Project.instance.getTwigFunction(word);
        if (func) {
            return HoverFactory.fromTwigFunction(func);
        }

        const components = ThemeFileUtils.getComponents(thisFile, true);

        const comp = components[word];
        if (comp) {
            return HoverFactory.fromComponent(comp);
        }
    }

    private isTwigTag(wordRange: vscode.Range): boolean {
        const twigTagRange = this.document!.getWordRangeAtPosition(this.position!, regExps.twigTagStart);
        if (!twigTagRange) {
            return false;
        }

        return wordRange.end.isEqual(twigTagRange.end);
    }

    private isFilter(wordRange: vscode.Range): boolean {
        return isRightAfter(this.document!, wordRange.start, regExps.twigStatementWithFilterGlobal, regExps.spacesOrEmpty);
    }
}
