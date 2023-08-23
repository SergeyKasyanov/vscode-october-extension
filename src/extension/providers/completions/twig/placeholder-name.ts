import * as vscode from "vscode";
import { Page } from "../../../../domain/entities/theme/page";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/completions";

const PUT_TAG = /\{\%\s*put\s+/g;
const PLACEHOLDER_NAME_PART = /^\w*$/;

/**
 * Completions with placeholders names in put tag param
 *
 * {% put '...' %}
 */
export class PlaceholderName implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof Page)) {
            return;
        }

        if (!themeFile.isOffsetInsideTwig(document.offsetAt(position))) {
            return;
        }

        const layout = themeFile.layout;
        if (!layout) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            PUT_TAG,
            PLACEHOLDER_NAME_PART
        )) {
            return;
        }


        return layout.placeholders.map(
            placeholder => new vscode.CompletionItem(placeholder, vscode.CompletionItemKind.Constant)
        );
    }
}
