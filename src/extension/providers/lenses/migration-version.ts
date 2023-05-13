import * as vscode from 'vscode';
import { Migration } from '../../../domain/entities/classes/migration';
import { Store } from '../../../domain/services/store';
import { phpSelector } from '../../helpers/file-selectors';
import { Plugin } from '../../../domain/entities/owners/plugin';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import * as yaml from 'yaml';
import path = require('path');

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

        const migrationClass = migration.phpClass;
        if (!migrationClass) {
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
        const versionYamlPath = (codeLens.migration!.owner as Plugin).versionYamlPath;

        const command: vscode.Command = {
            title: '',
            command: COMMAND_SHOW_MIGRATION_VERSION_FILE,
            arguments: [codeLens.migration],
            tooltip: 'Open version.yaml',
        };

        if (FsHelpers.exists(versionYamlPath)) {
            const versionYaml = yaml.parse(FsHelpers.readFile(versionYamlPath));
            const migrationPath = getRelationMigrationPath(codeLens.migration!);

            let migrationVersion: string | undefined;

            for (const version in versionYaml) {
                if (Object.prototype.hasOwnProperty.call(versionYaml, version)) {
                    const elements = versionYaml[version];
                    if (elements instanceof Array) {
                        for (const el of elements) {
                            if (el === migrationPath) {
                                migrationVersion = version;
                                break;
                            }
                        }
                    }
                }
            }

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

/**
 * Returns path to migration relative to updates forlder of migration's plugin
 */
function getRelationMigrationPath(migration: Migration): string {
    const updatesPath = path.join(migration.owner.path, 'updates');

    return migration.path
        .replace(updatesPath + path.sep, '')
        .replace(path.sep, '/');
}

async function openVersionYamlFile(migration: Migration) {
    const versionYamlPath = (migration.owner as Plugin).versionYamlPath;

    if (!FsHelpers.exists(versionYamlPath)) {
        return;
    }

    const uri = vscode.Uri.file(versionYamlPath);

    const document = await vscode.workspace.openTextDocument(uri);
    const migrationPath = getRelationMigrationPath(migration);
    const offset = document.getText().indexOf(migrationPath);
    const position = document.positionAt(offset);

    vscode.window.showTextDocument(uri, {
        selection: new vscode.Selection(position, position)
    });
}

class CodeLens extends vscode.CodeLens {
    migration?: Migration;
}
