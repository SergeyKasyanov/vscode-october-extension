import * as vscode from "vscode";
import { Model } from "../../../../domain/entities/classes/model";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const CASTS_PROPERTY = /(protected|public)\s+(array\s+){0,1}\$casts\s*=\s*(\[|array\()(\s*[\'\"]\w+[\'\"]\s*=>\s*(([\'\"][\w]+[\'\"])|[\w\:]+)\s*,)*\s*[\'\"]\w+[\'\"]\s*=>\s*[\'\"]/g;
const CAST_NAME_PART = /^\w*$/;
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
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const model = Store.instance.findEntity(document.fileName);
        if (!(model instanceof Model)) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            CASTS_PROPERTY,
            CAST_NAME_PART
        )) {
            return;
        }

        return CASTS.map(cast => {
            const item = new vscode.CompletionItem(cast, vscode.CompletionItemKind.EnumMember);
            item.range = document.getWordRangeAtPosition(position, CAST_NAME);

            return item;
        });
    }
}
