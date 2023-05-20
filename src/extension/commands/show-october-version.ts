import { chooseProject } from "./concerns/choose-project";
import * as vscode from 'vscode';

/**
 * Command for show OctoberCMS version of opened project
 */
export async function showOctoberVersion() {
    const project = await chooseProject();
    if (!project) {
        return;
    }

    vscode.window.showInformationMessage(project.platform!.versionName);
}
