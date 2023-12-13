import * as vscode from 'vscode';
import { Model } from '../../../domain/entities/classes/model';
import { findModelUsagesInYamlFiles } from '../../../domain/entities/concerns/find-model-usages-in-yaml-files';
import { Store } from '../../../domain/services/store';

/**
 * References for model in yaml configs
 */
export class ModelReference implements vscode.ReferenceProvider {

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext
    ): Promise<vscode.Location[] | undefined> {

        const model = this.getModel(document, position);
        if (!model) {
            return;
        }

        return await findModelUsagesInYamlFiles(model);
    }

    private getModel(document: vscode.TextDocument, position: vscode.Position): Model | undefined {
        const clickedRange = document.getWordRangeAtPosition(position, /class\s+\w+\s+extends/);
        if (!clickedRange) {
            return;
        }

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const model = Store.instance.findEntity(document.fileName);
        if (!(model instanceof Model)) {
            return;
        }

        const clickedUqn = document.getText(clickedRange).slice(5, -7).trim();
        if (clickedUqn !== model.uqn) {
            return;
        }

        return model;
    }


}
