import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import { twigFunctions } from "../../../domain/static/twig-functions";
import { Hover } from "../../factories/hover-factory";

const TWIG_STATEMENT = /\{[\{\%].*\w\(/;

/**
 * Hover for twig functions
 *
 * {{ trans('First Name') }}
 */
export class TwigFunction implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideTwig(document.offsetAt(position))) {
            return;
        }

        const insideTwigStatement = document.getWordRangeAtPosition(position, TWIG_STATEMENT);
        if (!insideTwigStatement) {
            return;
        }

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return;
        }

        const word = document.lineAt(position.line).text
            .slice(wordRange.start.character, wordRange.end.character);

        const func = {
            ...twigFunctions,
            ...themeFile.owner.project.twigFunctions
        }[word];

        if (!func) {
            return;
        }

        return Hover.fromTwigFunction(func);
    }
}
