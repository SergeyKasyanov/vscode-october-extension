import * as vscode from "vscode";
import { regExps } from "../../../helpers/regExps";
import { Project } from "../../../services/project";
import { HoverFactory } from "../../factories/hoverFactory";
import { isRightAfter } from "../../helpers/isRightAfter";
import { LineSectionChecks } from "../../helpers/lineSectionChecks";

export class TwigFilterHoverProvider implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        if (!LineSectionChecks.insideTwigSection(document, position)) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return;
        }

        if (!isRightAfter(document, wordRange.start, regExps.twigStatementWithFilterGlobal, regExps.spacesOrEmpty)) {
            return;
        }

        const word = document.lineAt(position.line).text.slice(wordRange.start.character, wordRange.end.character);
        const filter = Project.instance.getTwigFilter(word);

        if (!filter) {
            return;
        }

        return HoverFactory.fromTwigFilter(filter);
    }
}
