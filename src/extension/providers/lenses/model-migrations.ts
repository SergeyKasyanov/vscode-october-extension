import * as vscode from "vscode";
import { Migration } from "../../../domain/entities/classes/migration";
import { Model } from "../../../domain/entities/classes/model";
import { Store } from "../../../domain/services/store";
import { phpSelector } from "../../helpers/file-selectors";

const COMMAND_SHOW_MIGRATIONS_BY_MODEL = 'command.showMigrationsByModel';

export function registerModelMigrationsLensProvider(context: vscode.ExtensionContext) {
    vscode.languages.registerCodeLensProvider(phpSelector, new ModelMigrations());

    vscode.commands.registerCommand(COMMAND_SHOW_MIGRATIONS_BY_MODEL, showMigrations);
}

/**
 * Lens for model with links to all migrations
 * affecting table of this model
 */
class ModelMigrations implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
        const model = Store.instance.findEntity(document.fileName);
        if (!(model instanceof Model)) {
            return;
        }

        const tableProperty = model.phpClassProperties?.table;
        if (!tableProperty) {
            return;
        }

        const tableLoc = tableProperty.loc!;

        const range = new vscode.Range(
            new vscode.Position(tableLoc.start.line - 1, tableLoc.start.column),
            new vscode.Position(tableLoc.end.line - 1, tableLoc.end.column)
        );

        return [
            new vscode.CodeLens(range, {
                title: 'Go to migration',
                command: COMMAND_SHOW_MIGRATIONS_BY_MODEL,
                tooltip: 'Show all migrations with this table',
                arguments: [model]
            })
        ];
    }
}

async function showMigrations(model: Model) {
    const table = model.table;
    if (!table) {
        return;
    }

    const migrations = model.owner.project.migrations
        .filter(m => m.tables.includes(table))
        .reduce((acc: { [name: string]: Migration }, migration) => {
            const name = migration.path.replace(migration.owner.project.path, '');
            acc[name] = migration;

            return acc;
        }, {});

    if (Object.keys(migrations).length === 0) {
        vscode.window.showInformationMessage('There is no migrations affecting this table');
        return;
    }

    const fileToOpen = Object.keys(migrations).length === 1
        ? Object.keys(migrations)[0]
        : await vscode.window.showQuickPick(Object.keys(migrations), { title: 'Choose migration to open' });

    if (fileToOpen === undefined) {
        return;
    }

    const migration = migrations[fileToOpen];
    const uri = vscode.Uri.file(migration.path);

    vscode.window.showTextDocument(uri);
}
