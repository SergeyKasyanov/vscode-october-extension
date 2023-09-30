import * as vscode from 'vscode';
import { Store } from '../../../../domain/services/store';
import { PhpHelpers } from '../../../../domain/helpers/php-helpers';
import { awaitsCompletions, insideClassMethod } from '../../../helpers/completions';

const ITEM_TYPE_KEY = /itemType[\'\"]\s*=>\s*[\'\"]/g;
const ITEM_TYPE_PART = /^[\w]*$/;
const ITEM_TYPE_NAME = /[\w]+/;

/**
 * Completions for navigation item type
 *
 *    public function registerNavigation()
 *    {
 *        return [
 *            'acme' => [
 *                'label' => 'ACME',
 *                'sideMenu' => [
 *                    'catalog' => [
 *                        'label' => Catalog'
 *                        'itemType' => '...'
 *                    ]
 *                ]
 *            ],
 *        ];
 *    }
 */
export class MenuItemType implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const isRegistrationFile = document.fileName.endsWith('Plugin.php') || document.fileName.endsWith('Provider.php');
        if (!isRegistrationFile) {
            return;
        }

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        if (!project.platform?.hasMenuItemType) {
            return;
        }

        const phpClass = PhpHelpers.getClass(document.getText(), document.fileName);
        if (!phpClass) {
            return;
        }

        if (!insideClassMethod(phpClass, document.offsetAt(position), ['registerNavigation'])) {
            return;
        }

        if (!awaitsCompletions(
            document.lineAt(position.line).text,
            position.character,
            ITEM_TYPE_KEY,
            ITEM_TYPE_PART
        )) {
            return;
        }

        return ['primary', 'link', 'ruler', 'section'].map(type => {
            const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Enum);
            item.range = document.getWordRangeAtPosition(position, ITEM_TYPE_NAME);

            return item;
        });
    }
}
