import * as vscode from 'vscode';
import { chooseProject } from "./concerns/choose-project";

/**
 * Command for open blueprint
 */
export async function openBlueprint() {
    const project = await chooseProject();
    if (!project) {
        return;
    }

    if (!project.platform?.hasTailor) {
        vscode.window.showWarningMessage('This version of OctoberCMS does not support tailor');
        return;
    }

    if (!project.appDir) {
        vscode.window.showWarningMessage('Project does not have app directory');
        return;
    }

    const items = project.appDir.blueprints.map(b => new QuickPickItem(b.handle, b.relativePath, b.path));

    const handle = await vscode.window.showQuickPick(items, { title: 'Choose blueprint' });

    if (!handle) {
        return;
    }

    vscode.window.showTextDocument(vscode.Uri.file(handle.filePath));
}

class QuickPickItem implements vscode.QuickPickItem {
    constructor(
        public label: string,
        public description: string,
        public filePath: string
    ) { }
}
