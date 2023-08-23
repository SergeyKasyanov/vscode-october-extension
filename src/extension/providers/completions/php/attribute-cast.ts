import * as vscode from "vscode";
import { Model } from "../../../../domain/entities/classes/model";
import { Store } from "../../../../domain/services/store";
import { insideAssociativeArrayEntryValue, insideClassProperty } from "../../../helpers/completions";

const CAST_NAME = /\w+/;

const CASTS = [
    'integer',
    'real',
    'float',
    'double',
    'string',
    'boolean',
    'object',
    'array',
];

/**
 * Completions for cast types in protected $casts model property
 *
 * protected $casts = [
 *     'is_active' => '...'
 * ];
 */
export class AttributeCast implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[] | undefined {

        const model = Store.instance.findEntity(document.fileName);
        if (!(model instanceof Model)) {
            return;
        }

        const castsRange = insideClassProperty(
            model.phpClass!,
            document.offsetAt(position),
            ['casts']
        );

        if (!castsRange) {
            return;
        }

        if (!insideAssociativeArrayEntryValue(document, position, castsRange)) {
            return;
        }

        return CASTS.map(cast => {
            const item = new vscode.CompletionItem(cast, vscode.CompletionItemKind.EnumMember);
            item.range = document.getWordRangeAtPosition(position, CAST_NAME);

            return item;
        });
    }
}
