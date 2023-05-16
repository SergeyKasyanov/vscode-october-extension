import * as vscode from 'vscode';
import { Store } from '../../../../domain/services/store';
import { AppDirectory } from '../../../../domain/entities/owners/app-directory';
import { awaitsCompletions } from '../../../helpers/awaits-completions';
import { YamlHelpers } from '../../../helpers/yaml-helpers';

const HANDLE_LINK_KEY = /(parent|source):\s*/g;
const HANDLE_PART = /^[w\\]*$/;
const HANDLE = /[w\\]+/;

/**
 * Completions for blueprint handle in blueprint yamls
 *
 * navigation:
 *     parent: ...
 *
 * _social_links:
 *     label: Social Links
 *     type: mixin
 *     source: ...
 */
export class BlueprintHandle implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const owner = Store.instance.findOwner(document.fileName) as AppDirectory;
        if (!(owner instanceof AppDirectory)) {
            return;
        }

        const blueprint = owner.blueprints.find(b => b.path === document.fileName);
        if (!blueprint) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            HANDLE_LINK_KEY,
            HANDLE_PART
        )) {
            return;
        }

        const parent = YamlHelpers.getParent(document, position.line);
        if (parent === 'navigation') {
            return owner.blueprints.filter(b => b.hasPrimaryNavigation).map(b => {
                const item = new vscode.CompletionItem(b.handle, vscode.CompletionItemKind.Class);
                item.range = document.getWordRangeAtPosition(position, HANDLE);

                return item;
            });
        }

        const type = YamlHelpers.getSibling(document, position, 'type');
        if (type === 'mixin') {
            return owner.blueprints.filter(b => b.type === 'mixin').map(b => {
                const item = new vscode.CompletionItem(b.handle, vscode.CompletionItemKind.Class);
                item.range = document.getWordRangeAtPosition(position, HANDLE);

                return item;
            });
        }
    }
}
