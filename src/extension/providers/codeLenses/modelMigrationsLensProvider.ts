import { existsSync, readFileSync } from "fs";
import * as vscode from "vscode";
import { phpSelector } from "../../../helpers/fileSelectors";
import { pluginsPath } from "../../../helpers/paths";
import { PluginFileUtils } from "../../../helpers/pluginFileUtils";
import { readDirectoryRecursively } from "../../../helpers/readDirectoryRecursively";
import { regExps } from "../../../helpers/regExps";
import { Project } from "../../../services/project";
import path = require("path");
import { getClassPropertiesFromDocument } from "../../../helpers/parsePhp";

const COMMAND_SHOW_MIGRATIONS_BY_MODEL = 'command.showMigrationsByModel';

export function registerModelMigrationsLensProvider(context: vscode.ExtensionContext) {
    vscode.languages.registerCodeLensProvider(phpSelector, new ModelMigrationsLensProvider());

    vscode.commands.registerCommand(COMMAND_SHOW_MIGRATIONS_BY_MODEL, showMigrations);
}

class ModelMigrationsLensProvider implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (parsed?.directory !== 'models') {
            return;
        }

        const properties = getClassPropertiesFromDocument(document.getText(), document.fileName);
        if (!properties || !properties['table'] || !properties['table'].loc) {
            return;
        }

        const tableLoc = properties['table'].loc;

        const range = new vscode.Range(
            new vscode.Position(tableLoc.start.line - 1, tableLoc.start.column),
            new vscode.Position(tableLoc.end.line - 1, tableLoc.end.column)
        );

        return [
            new vscode.CodeLens(range)
        ];
    }

    resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        const document = vscode.window.activeTextEditor?.document;
        if (!document) {
            return;
        }

        const tableAttr = document.getText(codeLens.range).trim();
        const tableNameMatch = tableAttr.split('=')[1].match(regExps.quotedAlphaString);
        if (!tableNameMatch) {
            return;
        }

        const tableName = tableNameMatch[0].slice(1, -1);

        codeLens.command = {
            title: 'Find migrations',
            command: COMMAND_SHOW_MIGRATIONS_BY_MODEL,
            tooltip: 'Show all migrations with this table',
            arguments: [tableName]
        };

        return codeLens;
    }
}

async function showMigrations(tableName: string) {
    let migrations: { [short: string]: string } = {};

    const plugins = Project.instance.getPlugins();
    for (const code in plugins) {
        if (Object.prototype.hasOwnProperty.call(plugins, code)) {
            const plugin = plugins[code];
            const migrationsPath = pluginsPath(path.join(plugin.author.toLowerCase(), plugin.name.toLowerCase(), 'updates'));
            if (!existsSync(migrationsPath)) {
                continue;
            }

            const files = readDirectoryRecursively({ dir: migrationsPath, exts: ['php'] });

            for (const file of files) {
                const fullPath = path.join(migrationsPath, file);
                const fileContent = readFileSync(fullPath);
                const tableNameRegex = new RegExp('[\'\"]' + tableName + '[\'\"]');
                if (fileContent.toString().match(tableNameRegex)) {
                    migrations[file] = fullPath;
                }
            }
        }
    }

    if (Object.keys(migrations).length === 0) {
        vscode.window.showInformationMessage('There is no plugin migrations with this table');
        return;
    }

    const fileToOpen = await vscode.window.showQuickPick(Object.keys(migrations), { title: 'Choose migration to open' });
    if (fileToOpen === undefined) {
        return;
    }

    vscode.window.showTextDocument(vscode.Uri.file(migrations[fileToOpen]));
}
