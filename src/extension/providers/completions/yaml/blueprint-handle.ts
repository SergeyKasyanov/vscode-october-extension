import * as vscode from 'vscode';
import { Store } from '../../../../domain/services/store';
import { AppDirectory } from '../../../../domain/entities/owners/app-directory';
import { awaitsCompletions } from '../../../helpers/completions';
import { YamlHelpers } from '../../../helpers/yaml-helpers';
import { Blueprint } from '../../../../domain/entities/blueprint';
import { Theme } from '../../../../domain/entities/owners/theme';

const HANDLE_LINK_KEY = /(parent|source):\s*/g;
const HANDLE_PART = /^[\w\\]*$/;
const HANDLE = /[\w\\]+/;

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

        let blueprint: Blueprint | undefined;
        const owner = Store.instance.findOwner(document.fileName) as AppDirectory | Theme;
        if (owner instanceof AppDirectory || owner instanceof Theme) {
            blueprint = owner.blueprints.find(b => b.path === document.fileName);
        }

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

        const owners = [owner];
        if (owner instanceof Theme && owner.project.appDir) {
            owners.push(owner.project.appDir)
        }

        const parent = YamlHelpers.getParent(document, position.line);
        if (parent === 'navigation') {
            return owners.flatMap(o => o.blueprints.filter(b => b.hasPrimaryNavigation).map(b => {
                const item = new vscode.CompletionItem(b.handle, vscode.CompletionItemKind.Class);
                item.range = document.getWordRangeAtPosition(position, HANDLE);

                return item;
            }));
        }

        const type = YamlHelpers.getSibling(document, position, 'type');
        if (type === 'mixin') {
            return owners.flatMap(o => o.blueprints.filter(b => b.type === 'mixin').map(b => {
                const item = new vscode.CompletionItem(b.handle, vscode.CompletionItemKind.Class);
                item.range = document.getWordRangeAtPosition(position, HANDLE);

                return item;
            }));
        }
    }
}
