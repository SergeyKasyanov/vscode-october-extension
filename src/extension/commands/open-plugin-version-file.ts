import * as vscode from "vscode";
import { Plugin } from "../../domain/entities/owners/plugin";
import { FsHelpers } from "../../domain/helpers/fs-helpers";
import { chooseProject } from "./concerns/choose-project";
import path = require("path");

/**
 * Command for open version.yaml file of plugin
 */
export async function openVersionYaml() {

    const project = await chooseProject();
    if (!project) {
        return;
    }

    const plugins = project.plugins.reduce((acc: { [name: string]: string }, plugin: Plugin) => {
        const venrsionYamlPath = path.join(plugin.path, 'updates', 'version.yaml');
        if (FsHelpers.exists(venrsionYamlPath)) {
            acc[plugin.name] = venrsionYamlPath;
        }

        return acc;
    }, {});

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
