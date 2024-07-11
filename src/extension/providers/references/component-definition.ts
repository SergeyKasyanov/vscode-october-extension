import * as vscode from 'vscode';
import { guessClickedComponent } from './concerns/guess-component';

/**
 * Definitions for components
 */
export class ComponentDefinition implements vscode.DefinitionProvider {

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Definition | undefined> {
        const component = guessClickedComponent(document, position);
        if (!component) {
            return;
        }

        return new vscode.Location(
            vscode.Uri.file(component.path),
            component.classPosition!
        );
    }
}
