import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { twigTags } from "../../../../domain/static/twig-tags";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const TAG_START = /\{\%\s*/g;
const TAG_NAME = /^\w*$/;

/**
 * Tag names completions
 *
 * {% ... %}
 */
export class TwigTag implements vscode.CompletionItemProvider {

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
            TAG_START,
            TAG_NAME
        )) {
            return;
        }

        return Object.values(twigTags).map(tag => {
            return CompletionItem.fromTwigTag(tag);
        });
    }
}
