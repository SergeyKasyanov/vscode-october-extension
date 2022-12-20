import * as vscode from 'vscode';
import { Behavior } from '../../domain/entities/classes/behavior';
import { Component } from '../../domain/entities/classes/component';
import { Controller } from '../../domain/entities/classes/controller';
import { Model } from '../../domain/entities/classes/model';
import { Widget } from '../../domain/entities/classes/widget';
import { BackendOwner } from '../../domain/entities/owners/backend-owner';
import { FsHelpers } from '../../domain/helpers/fs-helpers';
import { Store } from '../../domain/services/store';
import path = require('path');

type EntityWithViews = Behavior | Component | Controller | Model | Widget;

/**
 * Command for open files related to currently opened class.
 * Like configs, views and partials for controllers, models or widgets.
 */
export async function openRelatedFile() {
    const document = vscode.window.activeTextEditor?.document;
    if (!document) {
        return;
    }

    let entity = Store.instance.findEntity(document.fileName) as EntityWithViews;
    if (!entity) {
        const owner = Store.instance.findOwner(document.fileName);
        if (!(owner instanceof BackendOwner)) {
            return;
        }

        entity = owner.findEntityByRelatedName(document.fileName) as EntityWithViews;
    }

    if (!entity || typeof entity.filesDirectory !== 'string') {
        return;
    }

    const relatedFilesList = FsHelpers.listFiles(entity.filesDirectory, true);

    const fileToOpen = await vscode.window.showQuickPick(relatedFilesList, { title: 'Choose file' });
    if (!fileToOpen) {
        return;
    }

    vscode.window.showTextDocument(vscode.Uri.file(path.join(entity.filesDirectory, fileToOpen)));
}
