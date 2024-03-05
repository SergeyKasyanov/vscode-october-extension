import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { Migration } from '../../../domain/entities/classes/migration';
import { Plugin } from '../../../domain/entities/owners/plugin';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { Store } from '../../../domain/services/store';
import { phpSelector } from '../../helpers/file-selectors';
import { getMigrationVersion } from '../../../domain/actions/get-migration-version';

const COMMAND_ADD_TO_VERSION = 'command.addToVersion';

export function registerMigrationAddToVersionLensProvider(context: vscode.ExtensionContext) {
    vscode.languages.registerCodeLensProvider(phpSelector, new MigrationAddToVersion);

    vscode.commands.registerCommand(COMMAND_ADD_TO_VERSION, addToVersion);
}

/**
 * Lens for show "add new version" command to migration
 */
class MigrationAddToVersion implements vscode.CodeLensProvider {

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

        if (!FsHelpers.exists(migration.owner.versionYamlPath)) {
            return;
        }

        if (getMigrationVersion(migration)) {
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
        codeLens.command = {
            title: 'Add to version...',
            command: COMMAND_ADD_TO_VERSION,
            arguments: [codeLens.migration],
            tooltip: 'Add to last version or create new',
        };

        return codeLens;
    }
}

async function addToVersion(migration: Migration) {
    const option = await vscode.window.showQuickPick([
        'Create new version',
        'Add to last version',
    ]);

    if (option === 'Create new version') {
        return createNewVersion(migration);
    }

    if (option === 'Add to last version') {
        return addToLastVersion(migration);
    }
}

function createNewVersion(migration: Migration) {
    const versionFile = (migration.owner as Plugin).versionYamlPath;
    const versionYaml = yaml.parse(FsHelpers.readFile(versionFile));

    let newVersion: string;

    const lastVersion = Object.keys(versionYaml).pop();
    if (lastVersion) {
        const parts = lastVersion.split('.');
        parts[2] = (parseInt(parts[2]) + 1).toString();

        newVersion = parts.join('.');
    } else {
        newVersion = '1.0.1';
    }

    const label = migration.filename.split('_').join(' ').replace('.php', '');

    versionYaml[newVersion] = [
        label,
        migration.pathInsideUpdates
    ];

    doEdit(versionFile, versionYaml);
}

function addToLastVersion(migration: Migration) {
    const versionFile = (migration.owner as Plugin).versionYamlPath;
    const versionYaml = yaml.parse(FsHelpers.readFile(versionFile));

    const label = migration.filename.split('_').join(' ').replace('.php', '');

    let lastVersion = Object.keys(versionYaml).pop();
    let lastVersionVal;
    if (!lastVersion) {
        lastVersion = '1.0.1';
        lastVersionVal = [label, migration.pathInsideUpdates];
    } else {
        lastVersionVal = versionYaml[lastVersion];
        if (typeof lastVersionVal === 'string') {
            lastVersionVal = [lastVersionVal, migration.pathInsideUpdates];
        } else {
            lastVersionVal.push(migration.pathInsideUpdates);
        }
    }

    versionYaml[lastVersion] = lastVersionVal;

    doEdit(versionFile, versionYaml);
}

function indent(): number {
    let indent = vscode.workspace.getConfiguration().get('editor.indentSize');
    if (indent === 'tabSize') {
        indent = vscode.workspace.getConfiguration().get('editor.tabSize');
    }

    return indent as number;
}

function doEdit(versionFile: string, versionYaml: any) {
    vscode.workspace.openTextDocument(versionFile).then(doc => {
        vscode.window.showTextDocument(doc).then(editor => {
            editor.edit(edit => {
                edit.replace(new vscode.Range(
                    new vscode.Position(0, 0),
                    new vscode.Position(editor.document.lineCount + 1, 0)
                ), yaml.stringify(versionYaml, { indent: indent() }));
            });
        });
    });
}

class CodeLens extends vscode.CodeLens {
    migration?: Migration;
}
