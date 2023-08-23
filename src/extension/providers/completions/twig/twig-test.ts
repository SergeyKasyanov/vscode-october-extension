import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { twigTests } from "../../../../domain/static/twig-tests";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions } from "../../../helpers/completions";

const TWIG_STMT_TESTED = /\{[\{\%].*\s*is\s*/g;
const TWIG_TEST_NAME = /^\w*$/;

/**
 * Twig tests completions
 *
 * {% if var is ... %}
 */
export class TwigTest implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
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
            TWIG_STMT_TESTED,
            TWIG_TEST_NAME
        )) {
            return;
        }

        return Object.values(twigTests).map(
            tt => CompletionItem.fromTwigTest(tt)
        );
    }
}
