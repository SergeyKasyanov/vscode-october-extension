import * as vscode from "vscode";
import { Page } from "../../../../domain/entities/theme/page";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const COMPONENT_TAG = /\{\%\s*component\s+[\'\"]/g;
const COMPONENT_NAME_PART = /^[\w\-\_\/]*$/;

/**
 * Completions for component names in twig component tag.
 *
 * {% component '...' %}
 */
export class ComponentName implements vscode.CompletionItemProvider {

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
            COMPONENT_TAG,
            COMPONENT_NAME_PART
        )) {
            return;
        }

        const completions: { [alias: string]: vscode.CompletionItem } = {};

        if (themeFile instanceof Page && themeFile.layout) {
            const layoutComponents = themeFile.layout.components;
            for (const alias in layoutComponents) {
                if (Object.prototype.hasOwnProperty.call(layoutComponents, alias)) {
                    const component = layoutComponents[alias];

                    completions[alias] = CompletionItem.fromComponent(component, alias);
                }
            }
        }

        const fileComponents = themeFile.components;
        for (const alias in fileComponents) {
            if (Object.prototype.hasOwnProperty.call(fileComponents, alias)) {
                const component = fileComponents[alias];

                completions[alias] = CompletionItem.fromComponent(component, alias);
            }
        }

        return Object.values(completions);
    }
}
