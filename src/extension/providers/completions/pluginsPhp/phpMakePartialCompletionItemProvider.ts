import path = require("path");
import * as fs from "fs";
import * as vscode from "vscode";
import { getPathCompletions } from "../../../../helpers/pathAutocomplete";
import { pluginsPath, rootPath } from "../../../../helpers/paths";
import { ParsedPluginFileName, PluginFileUtils } from "../../../../helpers/pluginFileUtils";
import { readDirectoryRecursively } from "../../../../helpers/readDirectoryRecursively";
import { regExps } from "../../../../helpers/regExps";
import { Platform } from "../../../../services/platform";
import { isRightAfter } from "../../../helpers/isRightAfter";
import pluralize = require("pluralize");

export class PhpMakePartialCompletionItemProvider implements vscode.CompletionItemProvider {

    private parsed?: ParsedPluginFileName;

    private document?: vscode.TextDocument;
    private position?: vscode.Position;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.parsed = PluginFileUtils.parseFileName(document.fileName);
        if (!this.parsed) {
            return;
        }

        if (!isRightAfter(document, position, regExps.phpMakePartialMethodStartGlobal, regExps.phpMakePartialMethodStartParamStart)) {
            return;
        }

        let entered = '';

        const lineText = document.lineAt(position.line).text;
        const reversedBeforePosition = [...lineText.slice(0, position.character)].reverse().join('');
        const quoteMatch = reversedBeforePosition.match(/[\'\"]/);
        if (quoteMatch) {
            entered = [...reversedBeforePosition.slice(0, quoteMatch.index)].reverse().join('');
        }

        if (entered.startsWith('$')) {
            return this.getPrefixedPathCompletions(pluginsPath(), '$', entered.slice(1), Platform.getInstance().getBackendViewExtensions())?.map(item => {
                item.range = document.getWordRangeAtPosition(position, regExps.phpMakePartialMethodParamWord);
                return item;
            });
        }

        if (entered.startsWith('~')) {
            return this.getPrefixedPathCompletions(rootPath(), '~', entered.slice(1), Platform.getInstance().getBackendViewExtensions())?.map(item => {
                item.range = document.getWordRangeAtPosition(position, regExps.phpMakePartialMethodParamWord);
                return item;
            });
        }

        this.document = document;
        this.position = position;

        if (this.parsed.directory === 'controllers') {
            const controllerDir = pluginsPath(
                path.join(this.parsed.vendor!, this.parsed.plugin!, 'controllers', this.parsed.classNameWithoutExt.toLowerCase())
            );

            if (!fs.existsSync(controllerDir)) {
                return;
            }

            return this.getPathCompletions(Platform.getInstance().getBackendViewExtensions());
        }
    }

    private getPathCompletions(exts: string[]) {
        const controllerName = pluralize.plural(this.parsed!.className!);
        const controllerViewsPath = pluginsPath(path.join(this.parsed!.vendor!, this.parsed!.plugin!, 'controllers', controllerName));

        if (!fs.existsSync(controllerViewsPath)) {
            return;
        }

        return readDirectoryRecursively({ dir: controllerViewsPath, exts })
            .map(function (file) {
                let fileParts = file.split(path.sep);
                if (fileParts[0] === '') {
                    fileParts.shift();
                }

                let name = fileParts.pop();
                if (!name) {
                    return undefined;
                }

                if (!name.startsWith('_')) {
                    return undefined;
                }

                fileParts.push(name.slice(1, -4));

                return fileParts.join('/');
            })
            .filter(file => !!file)
            .map(file => {
                const item = new vscode.CompletionItem(file!, vscode.CompletionItemKind.File);
                item.range = this.document!.getWordRangeAtPosition(this.position!, regExps.phpMakePartialMethodParamWord);

                return item;
            });
    }

    private getPrefixedPathCompletions(rootDir: string, prefixSymbol: string, entered: string, exts: string[]) {
        const prefix = entered !== '' ? prefixSymbol : '';

        if (!entered.endsWith('/')) {
            entered += '/';
        }

        return getPathCompletions(rootDir, entered, exts, prefix);
    }
}
