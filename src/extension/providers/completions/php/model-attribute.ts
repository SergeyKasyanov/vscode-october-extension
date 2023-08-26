import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { Model } from "../../../../domain/entities/classes/model";
import { Store } from "../../../../domain/services/store";
import { insideAssociativeArrayEntryKey, insideClassProperty } from "../../../helpers/completions";

const ATTRIBUTES_LISTINGS = [
    'guarded',
    'fillable',
];

const LISTS = [
    'dates',
    'jsonable',
    'visible',
    'hidden',
    'nullable',
    'hashable',
    'purgeable',
    'encryptable',
    'revisionable',
    'propagatable',
];

const ARRAY_KEYS = [
    'slugs',
    'rules',
    'casts',
    'attributeNames',
];

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

        const offset = document.offsetAt(position);

        let range;

        const phpClass = this.model.phpClass;
        if (!phpClass) {
            return;
        }

        range = insideClassProperty(phpClass, offset, ATTRIBUTES_LISTINGS);
        if (range && insideAssociativeArrayEntryKey(document, position, range)) {
            return this.docBlockedAttributesCompletions();
        }

        range = insideClassProperty(phpClass, offset, LISTS.concat(ARRAY_KEYS));
        if (range && insideAssociativeArrayEntryKey(document, position, range)) {
            return this.attributesCompletions();
        }

        range = insideClassProperty(phpClass, offset, ['belongsTo']);
        if (range && insideAssociativeArrayEntryKey(document, position, range)) {
            return this.guessedRelationsCompletions();
        }

        range = insideClassProperty(phpClass, offset, ['customMessages']);
        if (range && insideAssociativeArrayEntryKey(document, position, range)) {
            return this.customMessagesCompletions();
        }

        return;
    }

    private docBlockedAttributesCompletions(): vscode.CompletionItem[] {
        return this.model!.attributes.map(
            attr => new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property)
        );
    }

    private attributesCompletions(): vscode.CompletionItem[] {
        const attributes = [...new Set(
            this.model!
                .attributes
                .concat(this.model!.guessAttributes)
        )];

        return attributes.map(
            attr => new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property)
        );
    }

    private guessedRelationsCompletions(): vscode.CompletionItem[] {
        const attributes = [...new Set(
            this.model!
                .attributes
                .concat(this.model!.guessAttributes)
        )];

        return attributes
            .filter(attr => attr.endsWith('_id'))
            .map(attr => new vscode.CompletionItem(attr.slice(0, -3), vscode.CompletionItemKind.Property));
    }

    private customMessagesCompletions(): vscode.CompletionItem[] | undefined {
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
