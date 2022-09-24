import * as vscode from 'vscode';
import { getClassFilePath } from '../../helpers/getClassFilePath';
import { Project } from "../../services/project";

export class GoToModel {
    public async execute() {
        const plugins = Object.keys(Project.instance.getPlugins());

        let models = [];
        for (const code of plugins) {
            models.push(...Project.instance.getModelsFqnByPlugin(code));
        }

        const model = await vscode.window.showQuickPick(models, {
            title: 'Choose model'
        });

        if (!model) {
            return;
        }

        const filepath = getClassFilePath(model);
        if (!filepath) {
            return;
        }

        vscode.window.showTextDocument(vscode.Uri.file(filepath));
    }
}
