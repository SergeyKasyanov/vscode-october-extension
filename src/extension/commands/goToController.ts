import * as vscode from 'vscode';
import { getClassFilePath } from '../../helpers/getClassFilePath';
import { Project } from "../../services/project";

export class GoToController {
    public async execute() {
        const plugins = Object.keys(Project.instance.getPlugins());

        let controllers = [];
        for (const code of plugins) {
            controllers.push(...Project.instance.getControllersByPlugin(code, true));
        }

        const controller = await vscode.window.showQuickPick(controllers, {
            title: 'Choose controller'
        });

        if (!controller) {
            return;
        }

        const filepath = getClassFilePath(controller);
        if (!filepath) {
            return;
        }

        vscode.window.showTextDocument(vscode.Uri.file(filepath));
    }
}
