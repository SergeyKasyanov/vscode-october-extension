import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";

const COMPONENT_NAME = /\[[\\\w\s]+\]/g;

/**
 * Completions for component properties in INI section of theme file.
 *
 * [blogPost]
 * slug = ":slug"
 */
export class ComponentProperty implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        const offset = document.offsetAt(position);
        if (!themeFile.isOffsetInsideIni(offset)) {
            return;
        }

        const firstComponentIndex = themeFile.sections.ini!.indexOf('[');
        if (!firstComponentIndex || offset < firstComponentIndex) {
            return;
        }

        const equalSignIndex = document.lineAt(position.line).text.indexOf('=');
        if (equalSignIndex > -1 && position.character >= equalSignIndex) {
            return;
        }

        let componentAlias: string | undefined;

        const attachComponentMatches = themeFile.sections.ini!.matchAll(COMPONENT_NAME);
        for (const match of attachComponentMatches) {
            if (offset > match.index! + match[0].length) {
                componentAlias = match[0].slice(1, -1).split(/\s+/)[0];
            } else {
                break;
            }
        }

        if (!componentAlias) {
            return;
        }

        const component = themeFile.owner.project.components.find(c => c.alias === componentAlias);

        return component?.properties.map(
            property => CompletionItem.fromComponentProperty(property, ' = ')
        );
    }
}
