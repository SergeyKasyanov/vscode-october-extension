import path = require("path");
import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { ThemeFileUtils } from "../../../../helpers/themeFileUtils";
import { Themes } from "../../../../services/themes";
import { ThemeMarkupFile } from "../../../../types/theme/themeFile";
import { isRightAfter } from "../../../helpers/isRightAfter";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for partial vars in twig partial tag
 *
 * {% partial 'partialName' varName =  %}
 */
export class TwigPartialVarsCompletionItemProvider implements vscode.CompletionItemProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;
    private mode: 'tag' | 'var' | undefined;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        if (!LineSectionChecks.insideTwigSection(document, position)) {
            return;
        }

        this.document = document;
        this.position = position;

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        let partialName;
        if (isRightAfter(document, position, regExps.partialTagGlobal, regExps.spacesOrAttributes)) {
            partialName = this.findPartialFileForPartialAsTag();
        }

        if (!partialName && isRightAfter(document, position, regExps.partialFunctionArgsStartGlobal, regExps.spacesOrObjectAttributes)) {
            partialName = this.loadPartialFileForPartialVar();
        }

        if (!partialName) {
            return;
        }

        const partial = thisFile.theme.getPartial(partialName);
        if (!partial) {
            return;
        }

        const partialVars = partial.echoedVars;
        if (partialVars.length === 0) {
            return;
        }

        const components = Object.keys(ThemeFileUtils.getComponents(thisFile, true));

        return partialVars
            .filter(variable => !components.includes(variable))
            .map(variable => {
                let item = new vscode.CompletionItem(variable, vscode.CompletionItemKind.Property);

                if (this.mode === 'tag') {
                    item.insertText = variable + ' = ';
                } else if (this.mode === 'var') {
                    item.insertText = variable + ': ';
                } else {
                    item.insertText = variable;
                }

                return item;
            });
    }

    private findPartialFileForPartialAsTag() {
        const partialTagRange = this.document!.getWordRangeAtPosition(this.position!, regExps.partialTagFull);
        if (!partialTagRange) {
            return;
        }

        const found = this.document!.lineAt(this.position!.line).text.slice(partialTagRange.start.character, partialTagRange.end.character);

        const partialTagMatch = found.match(regExps.partialTag);
        if (!partialTagMatch) {
            return;
        }

        this.mode = 'tag';

        return partialTagMatch[0].match(regExps.partialName)![0].slice(1, - 1);
    }

    private loadPartialFileForPartialVar() {
        const partialTagRange = this.document!.getWordRangeAtPosition(this.position!, regExps.partialFunction);
        if (!partialTagRange) {
            return;
        }

        const found = this.document!.lineAt(this.position!.line).text.slice(partialTagRange.start.character, partialTagRange.end.character);

        const partialTagMatch = found.match(regExps.partialFunction);
        if (!partialTagMatch) {
            return;
        }

        const partialNameMatch = partialTagMatch[0].match(regExps.partialFunctionWithName);
        if (!partialNameMatch) {
            return;
        }

        this.mode = 'var';

        return partialNameMatch[0].replace(regExps.partialFunctionWithoutName, '').trim().slice(1, -1);
    }
}
