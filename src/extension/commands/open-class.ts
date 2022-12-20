import * as vscode from 'vscode';
import { BackendOwner } from '../../domain/entities/owners/backend-owner';
import { Store } from '../../domain/services/store';

/**
 * Command for open october class from related file editor
 */
export function openClass() {
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        return;
    }

    if (Store.instance.findEntity(document.fileName)) {
        return;
    }

    const owner = Store.instance.findOwner(document.fileName);
    if (!(owner instanceof BackendOwner)) {
        return;
    }

    const entity = owner.findEntityByRelatedName(document.fileName);
    if (!entity) {
        return;
    }

    vscode.window.showTextDocument(vscode.Uri.file(entity.path));
}
