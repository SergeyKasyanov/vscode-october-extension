import * as vscode from "vscode";
import { chooseProject } from "./concerns/choose-project";

/**
 * Command for open registration file of plugin or app directory
 */
export async function openPlugin() {
    const project = await chooseProject();
    if (!project) {
        return;
    }

    const plugins: { [name: string]: string } = {};
    if (project.platform!.hasAppDirectory && project.appDir) {
        plugins[project.appDir.name] = project.appDir.registrationFilePath;
    }
    project.plugins.forEach(plugin => {
        plugins[plugin.name] = plugin.registrationFilePath;
    });

    const name = await vscode.window.showQuickPick(Object.keys(plugins), { title: 'Choose plugin' });
    if (!name) {
        return;
    }

    const filepath = plugins[name];
    if (!filepath) {
        return;
    }

    vscode.window.showTextDocument(vscode.Uri.file(filepath));
}
