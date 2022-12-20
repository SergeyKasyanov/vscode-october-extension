import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { Model } from '../../domain/entities/classes/model';
import { BackendOwner } from '../../domain/entities/owners/backend-owner';
import { Store } from '../../domain/services/store';
import { Str } from '../../helpers/str';

/**
 * Command for add model attributes to corresponding model config (columns.yaml or fields.yaml)
 */
export async function addModelAttributes() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !editor.document || !editor.document.fileName.endsWith('.yaml')) {
        return;
    }

    const owner = Store.instance.findOwner(editor.document.fileName);
    if (!(owner instanceof BackendOwner)) {
        return;
    }

    const model = owner.findEntityByRelatedName(editor.document.fileName) as Model;
    if (!(model instanceof Model)) {
        return;
    }

    const currentConfig = yaml.parse(editor.document.getText());
    let attributes = [];

    try {
        attributes = getAttributesToAdd(model, currentConfig);
    } catch (err) {
        vscode.window.showErrorMessage((err as Error).message);
        return;
    }

    if (attributes.length === 0) {
        vscode.window.showInformationMessage('All columns already added');
        return;
    }

    const toAdd = await vscode.window.showQuickPick(attributes, {
        canPickMany: true,
        title: 'Choose model attributes'
    });

    if (toAdd === undefined || toAdd.length === 0) {
        return;
    }

    const { config, changed } = changeYamlConfig(currentConfig, toAdd);
    if (!changed) {
        return;
    }

    const edit = new vscode.WorkspaceEdit();
    edit.replace(
        editor.document.uri,
        new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(editor.document.lineCount, 0)
        ),
        yaml.stringify(config, { indent: 4 })
    );

    vscode.workspace.applyEdit(edit);
}

function getAttributesToAdd(model: Model, currentConfig: any): string[] {
    const attributes = [...new Set([
        ...model.attributes,
        ...model.guessAttributes,
        ...Object.keys(model.relations)
    ])];


    if (typeof currentConfig !== 'object') {
        return attributes;
    }

    let alreadyAdded: string[] = [];
    if (typeof currentConfig.columns === 'object') {
        alreadyAdded.push(...Object.keys(currentConfig.columns));
    } else if (typeof currentConfig.fields === 'object') {
        alreadyAdded.push(...Object.keys(currentConfig.fields));

        if (currentConfig.tabs?.fields) {
            alreadyAdded.push(...Object.keys(currentConfig.tabs.fields));
        }

        if (currentConfig.secondaryTabs?.fields) {
            alreadyAdded.push(...Object.keys(currentConfig.secondaryTabs.fields));
        }
    } else {
        throw new Error('Config must contain "fields:" or "columns:" root tag');
    }

    return attributes.filter(attr => !alreadyAdded.includes(attr)).sort();
}

function changeYamlConfig(config: any, attributes: string[]) {
    const key = config.columns ? 'columns' : 'fields';
    let changed = false;

    for (const attr of attributes) {
        config[key][attr] = {
            label: attr.split('_').map(word => Str.ucFirst(word)).join(' ')
        };
        changed = true;
    }

    return { config, changed };
}
