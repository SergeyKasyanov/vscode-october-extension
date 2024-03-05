import * as vscode from 'vscode';
import { getMigrationVersion } from '../../../domain/actions/get-migration-version';
import { Migration } from '../../../domain/entities/classes/migration';
import { Plugin } from '../../../domain/entities/owners/plugin';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { Store } from '../../../domain/services/store';
import { phpSelector } from '../../helpers/file-selectors';

const COMMAND_SHOW_MIGRATION_VERSION_FILE = 'command.showMigrationVersionFile';

export function registerMigrationVersionLensProvider(context: vscode.ExtensionContext) {
    vscode.languages.registerCodeLensProvider(phpSelector, new MigrationVersion);

    vscode.commands.registerCommand(COMMAND_SHOW_MIGRATION_VERSION_FILE, openVersionYamlFile);
}

/**
 * Lens for show version in with current migration used
 */
class MigrationVersion implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
        const migration = Store.instance.findEntity(document.fileName);
        if (!(migration instanceof Migration)) {
            return;
        }

        const migrationClass = migration.phpClass || migration.anonymousPhpClass;
        if (!migrationClass) {
            return;
        }

        if (!(migration.owner instanceof Plugin)) {
            return;
        }

        const start = new vscode.Position(
            migrationClass.loc!.start.line - 1,
            migrationClass.loc!.start.column
        );

        const range = new vscode.Range(start, start);

        const lens = new CodeLens(range);
        lens.migration = migration;

        return [lens];
    }

    resolveCodeLens(codeLens: CodeLens): vscode.ProviderResult<vscode.CodeLens> {
        const command: vscode.Command = {
            title: '',
            command: COMMAND_SHOW_MIGRATION_VERSION_FILE,
            arguments: [codeLens.migration],
            tooltip: 'Open version.yaml',
        };

        const versionYamlPath = (codeLens.migration!.owner as Plugin).versionYamlPath;

        if (FsHelpers.exists(versionYamlPath)) {
            const migrationVersion = getMigrationVersion(codeLens.migration!);

            command.title = migrationVersion
                ? `Version ${migrationVersion}`
                : 'Migration is not added to version.yaml';
        } else {
            command.title = 'Version.yaml file does not exists!';
        }

        codeLens.command = command;

        return codeLens;
    }
}

async function openVersionYamlFile(migration: Migration) {
    const versionYamlPath = (migration.owner as Plugin).versionYamlPath;

    if (!FsHelpers.exists(versionYamlPath)) {
        return;
    }

    const uri = vscode.Uri.file(versionYamlPath);

    const document = await vscode.workspace.openTextDocument(uri);
    const migrationPath = migration.pathInsideUpdates
    const offset = document.getText().indexOf(migrationPath);
    const position = document.positionAt(offset);

    vscode.window.showTextDocument(uri, {
        selection: new vscode.Selection(position, position)
    });
}

class CodeLens extends vscode.CodeLens {
    migration?: Migration;
}
