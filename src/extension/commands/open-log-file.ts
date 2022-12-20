import * as vscode from 'vscode';
import { FsHelpers } from "../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../domain/helpers/path-helpers";
import { chooseProject } from "./concerns/choose-project";
import path = require("path");

/**
 * Command for open log file
 */
export async function openLogFile() {
    const project = await chooseProject();
    if (!project) {
        return;
    }

    const logsDir = PathHelpers.rootPath(project.path, path.join('storage', 'logs'));
    const logFiles = FsHelpers.listFiles(logsDir, true, ['.log']);

    const file = await vscode.window.showQuickPick(logFiles, { title: 'Choose file' });
    if (!file) {
        return;
    }

    const filePath = PathHelpers.rootPath(project.path, path.join('storage', 'logs', ...file.split('/')));

    vscode.window.showTextDocument(vscode.Uri.file(filePath));
}
