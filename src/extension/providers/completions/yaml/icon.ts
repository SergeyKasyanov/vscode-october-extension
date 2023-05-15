import * as vscode from 'vscode';
import { Store } from '../../../../domain/services/store';
import { awaitsCompletions } from '../../../helpers/awaits-completions';
import { AppDirectory } from '../../../../domain/entities/owners/app-directory';
import { YamlHelpers } from '../../../helpers/yaml-helpers';
import { ocIcons } from '../../../../domain/static/oc-icons';

const ICON_KEY = /icon:\s*/g;
const ICON_PART = /^[\w\-]*$/;
const ICON_NAME = /[\w\-]+/;

/**
 * Completions for icon names in yaml files
 *
 * primaryNavigation:
 *     icon: ...
 *
 * navigation:
 *     icon: ...
 */
export class Icon implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const owner = Store.instance.findOwner(document.fileName) as AppDirectory;
        if (!(owner instanceof AppDirectory)) {
            return;
        }

        const bluprint = owner.blueprints.find(b => b.path === document.fileName);
        if (!bluprint) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            ICON_KEY,
            ICON_PART
        )) {
            return;
        }

        const parent = YamlHelpers.getParent(document, position.line);
        if (!parent || !['primaryNavigation', 'navigation'].includes(parent)) {
            return;
        }

        return ocIcons.map(icon => {
            const item = new vscode.CompletionItem(icon, vscode.CompletionItemKind.Enum);
            item.range = document.getWordRangeAtPosition(position, ICON_NAME);

            return item;
        });
    }
}
