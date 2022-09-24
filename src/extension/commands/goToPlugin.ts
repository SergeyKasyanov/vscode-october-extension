import * as vscode from "vscode";
import { getClassFilePath } from "../../helpers/getClassFilePath";
import { Project } from "../../services/project";

export class GoToPlugin {
    public async execute() {
        const plugins = Project.instance.getPlugins();

        let pluginFiles = [];
        for (const code in plugins) {
            if (Object.prototype.hasOwnProperty.call(plugins, code)) {
                const plugin = plugins[code];
                pluginFiles.push(
                    plugin.author + '\\' + plugin.name + '\\Plugin'
                );
            }
        }

        const plugin = await vscode.window.showQuickPick(pluginFiles);
        if (!plugin) {
            return;
        }

        const filepath = getClassFilePath(plugin);
        if (!filepath) {
            return;
        }

        vscode.window.showTextDocument(vscode.Uri.file(filepath));
    }
}
