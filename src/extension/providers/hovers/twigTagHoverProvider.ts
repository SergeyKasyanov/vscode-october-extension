import * as vscode from "vscode";
import { Project } from "../../../services/project";
import { HoverFactory } from "../../factories/hoverFactory";
import { LineSectionChecks } from "../../helpers/lineSectionChecks";
import { regExps } from "../../../helpers/regExps";

export class TwigTagHoverProvider implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        if (!LineSectionChecks.insideTwigSection(document, position)) {
            return;
        }

        const insideTwigTagStatement = document.getWordRangeAtPosition(position, regExps.twigTagStatement);
        if (!insideTwigTagStatement) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return;
        }

        const word = document.lineAt(position.line).text.slice(wordRange.start.character, wordRange.end.character);

        const tag = Project.instance.getTag(word);
        if (tag) {
            return HoverFactory.fromTwigFunction(tag);
        }
    }
}
