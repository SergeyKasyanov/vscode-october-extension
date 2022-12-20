import * as vscode from 'vscode';
import { Config } from '../../config';
import { chooseProject } from './concerns/choose-project';

/**
 * Command for open model class
 */
export async function openModel() {
    const project = await chooseProject();
    if (!project) {
        return;
    }

    const models: { [fqn: string]: string } = {};

    if (Config.showModulesEntitiesInGoToCommands) {
        project.models.forEach(model => models[model.fqn] = model.path);
    } else {
        if (project.appDir) {
            project.appDir.models.forEach(model => models[model.fqn] = model.path);
        }

        project.plugins.forEach(
            plugin => plugin.models.forEach(
                model => models[model.fqn] = model.path
            )
        );
    }

    const fqn = await vscode.window.showQuickPick(Object.keys(models), { title: 'Choose model' });
    if (!fqn) {
        return;
    }

    const filepath = models[fqn];
    if (!filepath) {
        return;
    }

    vscode.window.showTextDocument(vscode.Uri.file(filepath));
}
