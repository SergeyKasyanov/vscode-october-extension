import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { Model } from "../../../../domain/entities/classes/model";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const MODEL_PROPERTY = /(protected|public)\s+(array\s+){0,1}\$(guarded|fillable|dates|jsonable|visible|hidden|nullable|hashable|purgeable|encryptable|revisionable|propagatable)\s*=\s*(\[|array\()/g;
const BELONGS_TO = /public\s+(array\s+){0,1}\$belongsTo\s*=\s*(\[|array\()/g;
const MODEL_PROPERTY_SPACER = /^\s*[\'\"](\w*[\'\"],\s*[\'\"])*$/;

const MODEL_ASSOCIATIVE_PROPERTY = /(protected|public)\s+(array\s+){0,1}\$(slugs|rules|casts|attributeNames)\s*=\s*(\[|array\()/g;
const MODEL_ASSOCIATIVE_PROPERTY_SPACER = /^\s*(\s*[\'\"][\w\*\-\_\.]+[\'\"]\s*=>\s*(([\'\"].*[\'\"])|[\w:]+),\s*)*[\'\"]$/;

const CUSTOM_MESSAGES_PROPERTY = /(protected|public)\s+(array\s+){0,1}\$customMessages\s*=\s*(\[|array\()/g;
const CUSTOM_MESSAGES_PROPERTY_SPACER = /^\s*(\s*[\'\"][\w\*\-\_\.]+[\'\"]\s*=>\s*[\'\"].*[\'\"],\s*)*[\'\"][а-я\w\*\-\_\.]*$/;
const CUSTOM_MESSAGES_KEY = /[\w\*\-\_\.]+/;

/**
 * Completions for model attributes in default model properties
 *
 * protected $guarded = ['...'];
 * protected $fillable = ['...'];
 * public $rules = ['...'];
 */
export class ModelAttribute implements vscode.CompletionItemProvider {

    private document?: vscode.TextDocument;
    private position?: vscode.Position;

    private model?: Model;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        this.model = Store.instance.findEntity(document.fileName) as Model;
        if (!(this.model instanceof Model)) {
            return;
        }

        this.document = document;
        this.position = position;

        const content = document.getText();
        const offset = document.offsetAt(position);

        if (awaitsCompletions(content, offset, MODEL_PROPERTY, MODEL_PROPERTY_SPACER)
            || awaitsCompletions(content, offset, MODEL_ASSOCIATIVE_PROPERTY, MODEL_ASSOCIATIVE_PROPERTY_SPACER)
        ) {
            return this.model.attributes.map(
                attr => new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property)
            );
        }

        if (awaitsCompletions(content, offset, CUSTOM_MESSAGES_PROPERTY, CUSTOM_MESSAGES_PROPERTY_SPACER)) {
            return this.buildCustomMessagesCompletions();
        }

        if (awaitsCompletions(content, offset, BELONGS_TO, MODEL_ASSOCIATIVE_PROPERTY_SPACER)) {
            return this.model.attributes.filter(attr => attr.endsWith('_id')).map(
                attr => new vscode.CompletionItem(attr.slice(0, -3), vscode.CompletionItemKind.Property)
            );
        }

        return;
    }

    private buildCustomMessagesCompletions(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const rules = this.model?.phpClassProperties?.rules;
        if (!rules) {
            return;
        }

        const customMessagesKeys: string[] = [];

        (rules.value as phpParser.Array).items.forEach(entry => {
            const isFieldRulePaid = entry.kind === 'entry'
                && (entry as phpParser.Entry).key?.kind === 'string'
                && (entry as phpParser.Entry).value?.kind === 'string';

            if (!isFieldRulePaid) {
                return;
            }

            const fieldName = ((entry as phpParser.Entry).key as phpParser.String).value;

            ((entry as phpParser.Entry).value as phpParser.String).value
                .split('|')
                .forEach(ruleStmt => {
                    const rule = ruleStmt.split(':')[0];
                    if (rule) {
                        customMessagesKeys.push(fieldName + '.' + rule);
                    }
                });
        });

        return customMessagesKeys.map(attr => {
            const item = new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property);
            item.range = this.document!.getWordRangeAtPosition(this.position!, CUSTOM_MESSAGES_KEY);

            return item;
        });
    }
}
