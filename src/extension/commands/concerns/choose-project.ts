import * as vscode from 'vscode';
import { Project } from "../../../domain/entities/project";
import { Store } from "../../../domain/services/store";

/**
 * Helper for choose project from opened directories
 */
export async function chooseProject() {
    const projects = Store.instance.listProjects();
    if (projects.length === 0) {
        return;
    }

    let project: Project | undefined;
    if (projects.length === 1) {
        project = Store.instance.findProject(projects[0]);
    } else {
        const projectPath = await vscode.window.showQuickPick(projects, { title: 'Choose project' });
        if (!projectPath) {
            return;
        }

        project = Store.instance.findProject(projectPath);
    }

    return project;
}
