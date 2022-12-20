import * as vscode from 'vscode';
import { Config } from '../../config';
import { chooseProject } from './concerns/choose-project';

/**
 * Command for open controller class
 */
export async function openController() {
    const project = await chooseProject();
    if (!project) {
        return;
    }

    const controllers: { [fqn: string]: string } = {};

    if (Config.showModulesEntitiesInGoToCommands) {
        project.controllers.forEach(controller => controllers[controller.fqn] = controller.path);
    } else {
        if (project.appDir) {
            project.appDir.controllers.forEach(controller => controllers[controller.fqn] = controller.path);
        }

        project.plugins.forEach(
            plugin => plugin.controllers.forEach(
                controller => controllers[controller.fqn] = controller.path
            )
        );
    }

    const fqn = await vscode.window.showQuickPick(Object.keys(controllers), { title: 'Choose controller' });
    if (!fqn) {
        return;
    }

    const filepath = controllers[fqn];
    if (!filepath) {
        return;
    }

    vscode.window.showTextDocument(vscode.Uri.file(filepath));
}
