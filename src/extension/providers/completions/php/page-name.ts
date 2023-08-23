import * as vscode from 'vscode';
import { MarkupFile } from '../../../../domain/entities/theme/theme-file';
import { Store } from '../../../../domain/services/store';
import { CompletionItem } from '../../../factories/completion-item';
import { awaitsCompletions } from '../../../helpers/completions';

const PAGE_URL_METHOD = /->pageUrl\(\s*[\'\"]/g;
const PAGE_NAME_PART = /^[\w\-\/\.]*$/;
const PAGE_NAME = /[\w\-\/\.]+/;

/**
 * Completions for page names in php section
 *
 * $this->pageUrl('...')
 */
export class PageName implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        const offset = document.offsetAt(position);

        if (!themeFile.isOffsetInsidePhp(offset)) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            PAGE_URL_METHOD,
            PAGE_NAME_PART
        )) {
            return;
        }

        return themeFile.owner.pages.map(page => {
            const item = CompletionItem.fromThemeMarkupFile(page);
            item.range = document.getWordRangeAtPosition(position, PAGE_NAME);

            return item;
        });
    }
}
