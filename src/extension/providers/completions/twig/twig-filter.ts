import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { twigFilters } from "../../../../domain/static/twig-filters";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const TWIG_STMT_FILTERED = /\{[\{\%].*\|\s*/g;
const TWIG_FILTER_NAME = /^\w*$/;

/**
 * Completions for twig filter names
 *
 * {{ 'some text'|... }}
 */
export class TwigFilter implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideTwig(document.offsetAt(position))) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            TWIG_STMT_FILTERED,
            TWIG_FILTER_NAME
        )) {
            return;
        }

        const completions: vscode.CompletionItem[] = Object.values(twigFilters).map(
            tf => CompletionItem.fromTwigFilter(tf)
        );

        completions.push(...Object.values(themeFile.owner.project.twigFilters).map(
            tf => CompletionItem.fromTwigFilter(tf)
        ));

        return completions;
    }
}
