import * as vscode from "vscode";
import { OctoberEntity } from "../../../../domain/entities/october-entity";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const TABLE_RULE = /\s*(\s*[\'\"][\w\*\-\.]*[\'\"]\s*=>\s*[\'\"].*[\'\"],\s*)*[\'\"][\w\*\-\.]*[\'\"]\s*=>\s*[\'\"]([\w:,=\/]*\|)*(exists|unique):/g;
const TABLE_NAME_PART = /^[\w_]*$/;
const TABLE_NAME = /[\w_]+/;

/**
 * Completions for table names in unique and exists validation rules
 */
export class ValidationTableName implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const entity = Store.instance.findEntity(document.fileName);
        if (!entity || !this.checkFile(document, position, entity)) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            TABLE_RULE,
            TABLE_NAME_PART
        )) {
            return;
        }

        const tables = entity.owner.project.models.reduce((acc: string[], model) => {
            if (!model.isSettings) {
                const table = model.table;
                if (table && !acc.includes(table)) {
                    acc.push(table);
                }
            }

            return acc;
        }, []).sort();

        return tables.map(table => {
            const item = new vscode.CompletionItem(table, vscode.CompletionItemKind.Module);
            item.range = document.getWordRangeAtPosition(position, TABLE_NAME);

            return item;
        });
    }

    private checkFile(document: vscode.TextDocument, position: vscode.Position, entity: OctoberEntity) {
        if (entity instanceof MarkupFile) {
            return entity.isOffsetInsidePhp(document!.offsetAt(position!));
        }

        return document!.fileName.endsWith('.php');
    }
}
