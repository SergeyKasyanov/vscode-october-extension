import * as vscode from 'vscode';
import { BackendOwner } from '../../domain/entities/owners/backend-owner';
import { Project } from "../../domain/entities/project";

/**
 * Resolves backend uri to backend controller
 *
 * @param project
 * @param uri
 * @returns
 */
export function resolveBackendController(project: Project, uri: string) {
    const parts = uri.split('/');

    let code = parts.shift()!;

    let owner = project.findOwnerByName(code) as BackendOwner | undefined;
    if (!owner) {
        code += '.' + parts.shift()!;
        owner = project.findOwnerByName(code) as BackendOwner | undefined;
    }

    if (!owner) {
        return;
    }

    const controllerName = parts.length === 0
        ? 'index'
        : parts.shift();

    const controller = owner.controllers.find(c => c.uqn.toLowerCase() === controllerName);
    if (!controller) {
        vscode.window.showErrorMessage('Unknown controller');
        return;
    }

    const method = parts.length === 0
        ? 'index'
        : parts.shift()!;

    const range = controller.pageMethods[method];

    return {
        controller,
        method,
        range
    };
}
