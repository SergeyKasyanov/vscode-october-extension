import * as vscode from "vscode";
import { Controller } from "../../../../domain/entities/classes/controller";
import { Model } from "../../../../domain/entities/classes/model";
import { FsHelpers } from "../../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../../domain/helpers/path-helpers";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";
import { getPathCompletions } from "../../../helpers/path-autocomplete";

const CONFIG_PATH_PART = /^[\'\"]|((\[|(array\())\s*[\'\"][\w\-\_]+[\'\"]\s*=>\s*[\'\"]([\w\-\_\.\$\~\/]+[\'\"]\s*,\s*[\'\"][\w\-\_]+[\'\"]\s*=>\s*[\'\"])*)[\w\-\_\.\$\~\/]*$/;
const CONFIG_PATH = /[\$\~\w\\\/\-\_\.]+/;

/**
 * Completions for controllers and models behaviors config path
 *
 * public $listConfig = '...';
 * public $formConfig = '...';
 * public $settingsFields = '...';
 */
export class BehaviorConfigPath implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const entity = Store.instance.findEntity(document.fileName);
        if (!(entity instanceof Controller || entity instanceof Model)) {
            return;
        }

        const behaviors = Object.values(entity.behaviors).map(b => b.behavior);
        if (behaviors.length === 0) {
            return;
        }

        const requiredProperties = behaviors.flatMap(beh => beh.requiredProperties);

        const regExpStr = 'public\\s+\\$(' + requiredProperties.join('|') + ')\\s*=\\s*';
        const PROPERTY_NAME = new RegExp(regExpStr, 'g');

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            PROPERTY_NAME,
            CONFIG_PATH_PART
        )) {
            return;
        }

        let entered = '';

        const enteredRange = document.getWordRangeAtPosition(position, CONFIG_PATH);
        if (enteredRange) {
            const lineText = document.lineAt(enteredRange.start.line).text;
            entered = lineText.slice(enteredRange.start.character, enteredRange.end.character);
        }

        if (entered.startsWith('$')) {
            return this.getPrefixedPathCompletions(
                PathHelpers.pluginsPath(entity.owner.project.path),
                '$',
                entered.slice(1)
            )?.map(item => {
                item.range = document.getWordRangeAtPosition(position, CONFIG_PATH);
                return item;
            });
        }

        if (entered.startsWith('~')) {
            return this.getPrefixedPathCompletions(
                PathHelpers.rootPath(entity.owner.project.path),
                '~',
                entered.slice(1)
            )?.map(item => {
                item.range = document.getWordRangeAtPosition(position, CONFIG_PATH);
                return item;
            });
        }

        const filesDirectory = entity.filesDirectory;
        if (!FsHelpers.exists(filesDirectory)) {
            return;
        }

        return FsHelpers
            .listFiles(filesDirectory, true, ['.yaml'])
            .map(file => {
                const item = new vscode.CompletionItem(file!, vscode.CompletionItemKind.File);
                item.range = document.getWordRangeAtPosition(position, CONFIG_PATH);

                return item;
            });
    }

    private getPrefixedPathCompletions(rootDir: string, prefixSymbol: string, entered: string) {
        const prefix = entered !== '' ? prefixSymbol : '';

        if (!entered.endsWith('/')) {
            entered += '/';
        }

        return getPathCompletions(rootDir, entered, ['.yaml'], prefix);
    }
}
