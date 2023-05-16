import * as vscode from 'vscode';
import { Store } from '../../../../domain/services/store';
import { MarkupFile } from '../../../../domain/entities/theme/theme-file';

const HANDLE = /[\w\\]+/;

/**
 * Completions for blueprint handle in theme file ini section
 *
 * [section blog]
 * handle = "..."
 */
export class BlueprintHandle implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const project = Store.instance.findProject(document.fileName);
        const appDir = project?.appDir;
        if (!appDir) {
            return;
        }

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        const offset = document.offsetAt(position);
        if (!themeFile.isOffsetInsideIni(offset)) {
            return;
        }

        const beforeCursor = document.lineAt(position.line).text.slice(0, position.character);
        if (!beforeCursor.match(/^handle\s*=\s*[\'\"][\w\\]*$/)) {
            return;
        }

        const componentAttachment = this.findComponentAttachment(position, document);
        if (!componentAttachment) {
            return;
        }

        const alias = componentAttachment.slice(1, -1).split(/\s+/).reverse()[0];

        const component = themeFile.components[alias];
        if (component?.owner.name !== 'tailor') {
            return;
        }

        return appDir.blueprints
            .filter(b => b.type !== 'mixin')
            .map(b => {
                const item = new vscode.CompletionItem(b.handle, vscode.CompletionItemKind.Class);
                item.range = document.getWordRangeAtPosition(position, HANDLE);

                return item;
            });
    }

    private findComponentAttachment(position: vscode.Position, document: vscode.TextDocument) {
        for (let line = position.line - 1; line > 0; line--) {
            const lineText = document.lineAt(line).text;
            if (lineText.startsWith('[')) {
                return lineText;
            }
        }
    }
}
