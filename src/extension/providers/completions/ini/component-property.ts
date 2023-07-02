import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { CompletionItem } from "../../../factories/completion-item";
import { Partial } from "../../../../domain/entities/theme/partial";

const COMPONENT_NAME = /((\r?\n)|^)\[[\\\w\s]+\]/g;

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

        const firstComponentIndex = themeFile.sections.ini!.text.indexOf('[');
        if (firstComponentIndex === -1 || offset < firstComponentIndex) {
            return;
        }

        const equalSignIndex = document.lineAt(position.line).text.indexOf('=');
        if (equalSignIndex > -1 && position.character >= equalSignIndex) {
            return;
        }

        let componentAlias: string | undefined;

        const attachComponentMatches = themeFile.sections.ini!.text.matchAll(COMPONENT_NAME);
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

        if (component?.fqn === 'Cms\\Components\\ViewBag' && themeFile instanceof Partial) {
            const items = [
                'snippetCode',
                'snippetName',
                'snippetDescription',
            ].map(p => {
                const item = new vscode.CompletionItem(p);
                item.insertText = new vscode.SnippetString(p + ' = ');

                return item;
            });

            const snippetProperties = new vscode.CompletionItem('snippetProperties');
            snippetProperties.insertText = new vscode.SnippetString(`snippetProperties[$1][title] = "$2"
snippetProperties[$1][type] = "\$\{3|string,dropdown,checkbox|}"
snippetProperties[$1][default] = "$4"
snippetProperties[$1][options][$5] = "$6"$0`);

            items.push(snippetProperties);

            return items;
        }

        return component?.properties.map(
            property => CompletionItem.fromComponentProperty(property, ' = ')
        );
    }
}
