import * as vscode from "vscode";
import { PhpHelpers } from "../../../../domain/helpers/php-helpers";
import { ocIcons } from "../../../../domain/static/oc-icons";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const ICON_KEY = /icon[\'\"]\s*=>\s*[\'\"]/g;
const ICON_PART = /^[\w\-]*$/;
const ICON_NAME = /[\w\-]+/;

/**
 * Completions for icon names in plugin registration file
 *
 *     public function pluginDetails()
 *     {
 *         return [
 *             'icon' => '...'
 *         ];
 *     }
 *
 *     public function registerNavigation()
 *     {
 *         return [
 *            'demo' => [
 *                 'icon' => '...'
 *             ],
 *         ];
 *     }
 */
export class Icon implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const isRegistrationFile = document.fileName.endsWith('Plugin.php') || document.fileName.endsWith('Provider.php');
        if (!isRegistrationFile) {
            return;
        }

        const phpClass = PhpHelpers.getClass(document.getText(), document.fileName);
        if (!phpClass) {
            return;
        }

        const methods = PhpHelpers.getMethods(phpClass);

        let contains = false;
        const methodsLocations = [
            methods?.registerNavigation?.loc,
            methods?.pluginDetails?.loc,
            methods?.registerSettings?.loc,
        ];

        for (const loc of methodsLocations) {
            if (!loc) {
                continue;
            }

            const methodRange = new vscode.Range(
                new vscode.Position(loc!.start.line - 1, loc!.start.column),
                new vscode.Position(loc!.end.line - 1, loc!.end.column)
            );

            if (methodRange.contains(position)) {
                contains = true;
                break;
            }
        }

        if (!contains) {
            return;
        }

        if (!awaitsCompletions(
            document.lineAt(position.line).text,
            position.character,
            ICON_KEY,
            ICON_PART
        )) {
            return;
        }

        return ocIcons.map(icon => {
            const item = new vscode.CompletionItem('icon-' + icon, vscode.CompletionItemKind.Enum);
            item.range = document.getWordRangeAtPosition(position, ICON_NAME);

            return item;
        });
    }
}
