import * as vscode from "vscode";
import * as fs from "fs";
import { pluginsPath } from "../../../../helpers/paths";
import { PluginFileUtils } from "../../../../helpers/pluginFileUtils";
import { regExps } from "../../../../helpers/regExps";
import { isRightAfter } from "../../../helpers/isRightAfter";
import path = require("path");
import { readDirectoryRecursively } from "../../../../helpers/readDirectoryRecursively";

export class PhpControllerBehaviorConfigPathCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (!parsed || parsed.directory !== 'controllers') {
            return;
        }

        if (!isRightAfter(document, position, regExps.phpBehaviorConfigPropertyGlobal, regExps.phpStringOrArrayValue)) {
            return;
        }

        const controllerDir = pluginsPath(
            path.join(parsed.vendor!, parsed.plugin!, 'controllers', parsed.classNameWithoutExt.toLowerCase())
        );

        if (!fs.existsSync(controllerDir)) {
            return;
        }

        return readDirectoryRecursively({ dir: controllerDir, exts: ['yaml'] })
            .map(file => {
                const item = new vscode.CompletionItem(file, vscode.CompletionItemKind.File);
                item.range = document.getWordRangeAtPosition(position, regExps.phpStringOrrArrayValueWord);

                return item;
            });
    }
}
