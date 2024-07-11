import * as vscode from 'vscode';
import { findComponentUsages } from '../../../domain/actions/find-component-usages';
import { Component } from '../../../domain/entities/classes/component';
import { Store } from '../../../domain/services/store';

/**
 * Code lens for showing references to cms component
 */
export class ComponentUsages implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
        const component = Store.instance.findEntity(document.fileName);
        if (!(component instanceof Component)) {
            return;
        }

        const range = new vscode.Range(
            new vscode.Position(component.phpClass!.loc!.start.line - 1, 0),
            new vscode.Position(component.phpClass!.loc!.end.line - 1, 0),
        );

        const lens = new CodeLens(range);
        lens.uri = document.uri;
        lens.component = component;

        return [lens];
    }

    async resolveCodeLens?(codeLens: CodeLens): Promise<CodeLens> {
        const references = await findComponentUsages(codeLens.component!);

        codeLens.command = {
            title: `${references.length} usages in themes`,
            tooltip: 'Find all usages in themes',
            arguments: [
                codeLens.uri,
                codeLens.range.start,
                references
            ],
            command: 'editor.action.showReferences'
        };

        return codeLens;
    }

}

class CodeLens extends vscode.CodeLens {
    component?: Component;
    uri?: vscode.Uri;
}
