import * as vscode from "vscode";
import { OctoberEntity } from "../../../../domain/entities/october-entity";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";
import { Migration } from "../../../../domain/entities/classes/migration";

const TABLE_RULE = /\s*(\s*[\'\"][\w\*\-\.]*[\'\"]\s*=>\s*[\'\"].*[\'\"],\s*)*[\'\"][\w\*\-\.]*[\'\"]\s*=>\s*[\'\"]([\w:,=\/]*\|)*(exists|unique):/g;
const TABLE_NAME_PART = /^[\w_]*$/;
const TABLE_NAME = /[\w_]+/;

const SCHEMA_METHOD = /Schema\s*::(hasTable|hasColumn|hasColumns|whenTableHasColumn|whenTableDoesntHaveColumn|getColumnType|getColumnListing|table|create|drop|dropIfExists|dropColumns)\s*\(\s*[\'\"]/g;
const CONSTRAIN = /->(constrained|on)\s*\(\s*[\'\"]/g;

/**
 * Completions for table names in unique and exists validation rules
 */
export class TableName implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const entity = Store.instance.findEntity(document.fileName);
        const project = Store.instance.findProject(document.fileName);
        if (!project || !this.checkFile(document, position, entity)) {
            return;
        }

        if (entity instanceof Migration) {
            if (!awaitsCompletions(
                document.getText(),
                document.offsetAt(position),
                [CONSTRAIN, SCHEMA_METHOD],
                TABLE_NAME_PART
            )) {
                return;
            }
        } else {
            if (!awaitsCompletions(
                document.getText(),
                document.offsetAt(position),
                TABLE_RULE,
                TABLE_NAME_PART
            )) {
                return;
            }
        }

        const tables = project.migrations.reduce((acc: string[], migration) => {
            migration.tables.forEach(table => {
                if (!acc.includes(table)) {
                    acc.push(table);
                }
            });

            return acc;
        }, []).sort();

        return tables.map(table => {
            const item = new vscode.CompletionItem(table, vscode.CompletionItemKind.Module);
            item.range = document.getWordRangeAtPosition(position, TABLE_NAME);

            return item;
        });
    }

    private checkFile(document: vscode.TextDocument, position: vscode.Position, entity: OctoberEntity | undefined) {
        if (entity instanceof MarkupFile) {
            return entity.isOffsetInsidePhp(document!.offsetAt(position!));
        }

        return document!.fileName.endsWith('.php');
    }
}