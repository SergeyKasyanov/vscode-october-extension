import * as vscode from "vscode";
import { Migration } from "../../../domain/entities/classes/migration";
import { Store } from "../../../domain/services/store";
import { phpSelector } from "../../helpers/file-selectors";

const COMMAND_SHOW_MODEL_BY_TABLE = 'command.showModelByTable';

export function registerMigrationModelLensProvider(context: vscode.ExtensionContext) {
    vscode.languages.registerCodeLensProvider(phpSelector, new MigrationModel());

    vscode.commands.registerCommand(COMMAND_SHOW_MODEL_BY_TABLE, showModels);
}

const SEARCH_TABLES = /Schema\s*::\s*(create|table|drop|dropIfExists)\s*\(\s*[\'\"][\w\_]+[\'\"]/g;
const TABLE_NAME = /[\'\"][\w\_]+[\'\"]/;

/**
 * Lens for migration with link to model using
 * table affected by migration
 */
class MigrationModel implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
        const migration = Store.instance.findEntity(document.fileName);
        if (!(migration instanceof Migration)) {
            return;
        }

        const lenses: vscode.CodeLens[] = [];

        const matches = document.getText().matchAll(SEARCH_TABLES);
        for (const match of matches) {
            const tableNameMatch = match[0].match(TABLE_NAME);
            const tableName = tableNameMatch![0].slice(1, -1);

            const start = document.positionAt(match!.index! + tableNameMatch!.index! + 1);
            const end = start.translate(0, tableName.length);
            const range = new vscode.Range(start, end);

            lenses.push(new vscode.CodeLens(range, {
                title: 'Go to model',
                command: COMMAND_SHOW_MODEL_BY_TABLE,
                tooltip: 'Find models using this table',
                arguments: [migration, tableName]
            }));
        }

        return lenses;
    }
}

async function showModels(migration: Migration, tableName: string) {
    const models = migration.owner.project.models
        .filter(model => model.table === tableName);

    if (models.length === 0) {
        vscode.window.showInformationMessage('Models not found');
        return;
    }

    const fqn = models.length === 1
        ? models[0].fqn
        : await vscode.window.showQuickPick(models.map(m => m.fqn), { title: 'Choose model' });


    if (fqn === undefined) {
        return;
    }

    const model = models.find(m => m.fqn === fqn);
    if (!model) {
        return;
    }

    const uri = vscode.Uri.file(model.path);

    vscode.window.showTextDocument(uri);
}
