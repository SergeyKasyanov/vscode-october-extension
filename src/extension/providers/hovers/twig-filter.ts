import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import { twigFilters } from "../../../domain/static/twig-filters";
import { Hover } from "../../factories/hover-factory";
import { awaitsCompletions } from "../../helpers/completions";

const TWIG_STMT_FILTERED = /\{[\{\%].*\|\s*/g;
const TWIG_FILTER_NAME = /^\w*$/;

/**
 * Hover for twig filters
 *
 * {{ 'blog/post'|page }}
 */
export class TwigFilter implements vscode.HoverProvider {

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

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(wordRange.start),
            TWIG_STMT_FILTERED,
            TWIG_FILTER_NAME
        )) {
            return;
        }

        const word = document.lineAt(position.line).text
            .slice(wordRange.start.character, wordRange.end.character);

        const filter = {
            ...twigFilters,
            ...themeFile.owner.project.twigFilters
        }[word];

        if (!filter) {
            return;
        }

        return Hover.fromTwigFilter(filter);
    }
}
