import * as vscode from "vscode";
import { phpSelector } from "../../../helpers/fileSelectors";
import { getClassFilePath } from "../../../helpers/getClassFilePath";
import { PluginFileUtils } from "../../../helpers/pluginFileUtils";
import { regExps } from "../../../helpers/regExps";
import { Project } from "../../../services/project";
import { Model } from "../../../types/plugin/model";

const COMMAND_SHOW_MODEL_BY_TABLE = 'command.showModelByTable';

export function registerMigrationModelLensProvider(context: vscode.ExtensionContext) {
    vscode.languages.registerCodeLensProvider(phpSelector, new MigrationModelLensProvider());

    vscode.commands.registerCommand(COMMAND_SHOW_MODEL_BY_TABLE, showModels);
}

class MigrationModelLensProvider implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (parsed?.directory !== 'updates') {
            return;
        }

        let lenses: vscode.CodeLens[] = [];

        const matches = document.getText().matchAll(regExps.phpSchemaGlobal);
        for (const match of matches) {
            const tableNameMatch = match[0].match(regExps.phpSchemaTableName);
            const tableName = tableNameMatch![0].slice(1, -1);

            const models = Project.instance.getModelsByTable(tableName);
            if (models.length === 0) {
                continue;
            }

            const range = new vscode.Range(
                document.positionAt(match!.index! + tableNameMatch!.index! + 1),
                document.positionAt(match!.index! + tableNameMatch!.index! + 1 + tableName.length)
            );

            lenses.push(new vscode.CodeLens(range, {
                title: 'Go to model',
                command: COMMAND_SHOW_MODEL_BY_TABLE,
                tooltip: 'Find models using this table',
                arguments: [models]
            }));
        }

        return lenses;
    }
}

async function showModels(models: Model[] = []) {
    if (models.length === 0) {
        vscode.window.showInformationMessage('Models not found');
        return;
    }

    let fqn: string | undefined;

    if (models.length === 1) {
        fqn = models[0].fqn;
    } else {
        fqn = await vscode.window.showQuickPick(models.map(m => m.fqn), { title: 'Choose model' });
    }

    if (fqn === undefined) {
        return;
    }

    const filePath = getClassFilePath(fqn);
    if (!filePath) {
        return;
    }

    vscode.window.showTextDocument(vscode.Uri.file(filePath));
}
