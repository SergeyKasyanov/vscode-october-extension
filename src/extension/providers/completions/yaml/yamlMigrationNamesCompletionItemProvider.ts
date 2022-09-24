import path = require("path");
import * as vscode from "vscode";
import { readDirectoryRecursively } from "../../../../helpers/readDirectoryRecursively";
import { regExps } from "../../../../helpers/regExps";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class YamlMigrationNamesCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!document.fileName.endsWith(path.sep + 'updates' + path.sep + 'version.yaml')) {
            return;
        }

        if (!isRightAfter(document, position, regExps.yamlVersionGlobal, regExps.yamlVersionToMigrationRows)) {
            return;
        }

        const migrationFiles = readDirectoryRecursively({
            dir: document.fileName.slice(0, -1 * ('version.yaml'.length)),
            exts: ['.php']
        });

        return migrationFiles.map(
            file => new vscode.CompletionItem(file, vscode.CompletionItemKind.File)
        );
    }
}
