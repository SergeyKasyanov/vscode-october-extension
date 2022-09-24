import * as vscode from "vscode";
import { parsePhp } from "../../../helpers/parsePhp";
import { pluginsPath } from "../../../helpers/paths";
import { PluginFileUtils } from "../../../helpers/pluginFileUtils";
import { regExps } from "../../../helpers/regExps";
import { Themes } from "../../../services/themes";
import { isRightAfter } from "../../helpers/isRightAfter";
import { LineSectionChecks } from "../../helpers/lineSectionChecks";
import rules from "../../staticData/validationRules";

export class PhpValidationRuleCompletionItemProvider implements vscode.CompletionItemProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        if (!this.checkFile()) {
            return;
        }

        if (!this.awaitsValidationRules()) {
            return;
        }

        let items = [];

        for (const ruleName in rules) {
            if (Object.prototype.hasOwnProperty.call(rules, ruleName)) {
                const rule = rules[ruleName];

                let item = new vscode.CompletionItem(ruleName, vscode.CompletionItemKind.Enum);
                item.insertText = new vscode.SnippetString(rule.snippet);

                items.push(item);
            }
        }

        return items;
    }

    private checkFile(): boolean {
        if (Themes.instance.isThemeFile(this.document!.fileName)) {
            return LineSectionChecks.insidePhpSection(this.document!, this.position!);
        }

        return this.document!.fileName.endsWith('.php')
            && this.document!.fileName.startsWith(pluginsPath());
    }

    private awaitsValidationRules(): boolean {
        const pluginFile = PluginFileUtils.parseFileName(this.document!.fileName);

        if (pluginFile && pluginFile.directory === 'models') {
            if (isRightAfter(this.document!, this.position!, regExps.phpModelRulesAttributesGlobal, regExps.phpModelRulesValues)) {
                return true;
            }
        }

        const phpFile = this.document!.fileName.endsWith('.php')
            && this.document!.fileName.startsWith(pluginsPath());

        const insidePhpSection = Themes.instance.isThemeFile(this.document!.fileName)
            && LineSectionChecks.insidePhpSection(this.document!, this.position!);

        if (phpFile || insidePhpSection) {
            const offset = this.document!.offsetAt(this.position!);

            const searchFrom = Math.max(offset - 200, 0);
            const searchTo = offset + 200;

            const codeSlice = this.document!.getText().slice(searchFrom, searchTo);
            const makeValidatorMatch = codeSlice.match(regExps.phpMakingValidator);
            if (!makeValidatorMatch) {
                return false;
            }

            const validatorStart = searchFrom + makeValidatorMatch.index!;
            const validatorEnd = validatorStart + makeValidatorMatch[0].length;

            const validationRange = new vscode.Range(
                this.document!.positionAt(validatorStart),
                this.document!.positionAt(validatorEnd)
            );

            if (!validationRange.contains(this.position!)) {
                return false;
            }

            return isRightAfter(this.document!, this.position!, regExps.arrayValueGlobal, regExps.phpValidationRulesValue);
        }

        return false;
    }
}
