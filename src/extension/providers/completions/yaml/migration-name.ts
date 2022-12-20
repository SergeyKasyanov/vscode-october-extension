import * as vscode from "vscode";
import { FsHelpers } from "../../../../domain/helpers/fs-helpers";
import { awaitsCompletions } from "../../../helpers/awaits-completions";
import { YamlHelpers } from "../../../helpers/yaml-helpers";
import path = require("path");

const ARRAY_ELEMENT = /\s+\-\s+/g;
const MIGRATION_PART = /^[\w\_\-\.\/\\]*$/;
const MIGRATION = /[\w\_\-\.\/\\]+$/;

/**
 * Completions for migrations name in version.yaml
 *
 * 1.0.1:
 *     - First version of My.Plugin
 *     - ...
 */
export class MigrationName implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!document.fileName.endsWith(path.join('updates', 'version.yaml'))) {
            return;
        }

        const content = document.getText();
        const offset = document.offsetAt(position);

        if (!awaitsCompletions(content, offset, ARRAY_ELEMENT, MIGRATION_PART)) {
            return;
        }

        const parentLine = YamlHelpers.getParentLine(document, position.line);
        if (parentLine === undefined) {
            return;
        }

        if (position.line - parentLine < 2) {
            return;
        }

        const updatesDir = document.fileName.slice(0, -1 * ('version.yaml'.length));

        return FsHelpers
            .listFiles(updatesDir, true)
            .filter(fileName => fileName.endsWith('.php'))
            .map(fileName => {
                const item = new vscode.CompletionItem(fileName, vscode.CompletionItemKind.File);
                item.range = document.getWordRangeAtPosition(position, MIGRATION);

                return item;
            });
    }
}
