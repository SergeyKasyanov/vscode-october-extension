import * as vscode from 'vscode';
import { Controller } from '../../../domain/entities/classes/controller';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { Store } from '../../../domain/services/store';
import { YamlHelpers } from '../../helpers/yaml-helpers';
import path = require('path');

const TOOLBAR_BUTTONS = /toolbarButtons:\s*[\w\-\_\|]+/g;

/**
 * Document links for custom relation controller toolbar buttons
 */
export class CustomRelationToolbarButton implements vscode.DocumentLinkProvider {

    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
        const owner = Store.instance.findOwner(document.fileName) as BackendOwner;
        if (!(owner instanceof BackendOwner)) {
            return;
        }

        const controller = owner.findEntityByRelatedName(document.fileName) as Controller;
        if (!(controller instanceof Controller)) {
            return;
        }

        const configs = controller.getBehaviorConfigPaths('Backend\\Behaviors\\RelationController');
        if (!configs || !configs.default || !FsHelpers.exists(configs.default)) {
            return;
        }

        if (configs.default !== document.fileName) {
            return;
        }

        const links = [];

        const matches = document.getText().matchAll(TOOLBAR_BUTTONS);
        for (const match of matches) {
            const line = document.positionAt(match.index!).line;
            const value = YamlHelpers.getKeyAndValue(document.lineAt(line).text).value;
            if (!value) {
                continue;
            }

            let matchOffset = match[0].indexOf(value);
            for (const btn of value.split('|')) {
                const filePath = path.join(controller.filesDirectory, '_relation_button_' + btn + '.' + owner.project.platform?.mainBackendViewExtension);
                if (!FsHelpers.exists(filePath)) {
                    matchOffset += btn.length + 1;
                    continue;
                }

                const startOffset = match.index! + matchOffset;
                const start = document.positionAt(startOffset);
                const end = start.translate(0, btn.length);
                const range = new vscode.Range(start, end);

                const link = new vscode.DocumentLink(range);
                link.target = vscode.Uri.file(filePath);

                links.push(link);

                matchOffset += btn.length + 1;
            }
        }

        return links;
    }
}
