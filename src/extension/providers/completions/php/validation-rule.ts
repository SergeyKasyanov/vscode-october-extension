import * as vscode from "vscode";
import { Model } from "../../../../domain/entities/classes/model";
import { OctoberEntity } from "../../../../domain/entities/october-entity";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { rules } from "../../../../domain/static/validation-rules";
import { awaitsCompletions } from "../../../helpers/completions";

const ARRAY_VALUE = /=>\s*[\'\"]/g;
const RULES_PROPERTY = /(protected|public)\s+(array\s+){0,1}\$rules\s*=\s*(\[|array\()/g;
const RULES_VALUE = /^\s*(\s*[\'\"][\w\*\-\.]*[\'\"]\s*=>\s*[\'\"].*[\'\"],\s*)*[\'\"][\w\*\-\.]*[\'\"]\s*=>\s*[\'\"]([\w:,=\/]*\|)*$/;
const VALIDATOR_MAKE = /(validator\(|Validator::make\()(.|\r?\n)*?\)/;
const VALIDATION_RULE = /[\w\|\:\,]*/;

/**
 * Completions for validation rules
 *
 * Validator::make($data, [
 *     'field' => '...'
 * ]);
 */
export class ValidationRule implements vscode.CompletionItemProvider {

    private document?: vscode.TextDocument;
    private position?: vscode.Position;
    private entity?: OctoberEntity;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        this.entity = Store.instance.findEntity(this.document!.fileName);

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
        if (this.entity instanceof MarkupFile) {
            return this.entity.isOffsetInsidePhp(this.document!.offsetAt(this.position!));
        }

        return this.document!.fileName.endsWith('.php');
    }

    private awaitsValidationRules(): boolean {
        const content = this.document!.getText();
        const offset = this.document!.offsetAt(this.position!);

        if (this.entity instanceof Model
            && awaitsCompletions(content, offset, RULES_PROPERTY, RULES_VALUE)
        ) {
            return true;
        }

        const searchFrom = Math.max(offset - 300, 0);
        const searchTo = offset + 300;

        const codeSlice = content.slice(searchFrom, searchTo);
        const makeValidatorMatch = codeSlice.match(VALIDATOR_MAKE);
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

        return !!awaitsCompletions(content, offset, ARRAY_VALUE, VALIDATION_RULE);
    }
}
