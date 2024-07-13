import * as vscode from 'vscode';
import { findComponentUsages } from '../../../domain/actions/find-component-usages';
import { Component } from '../../../domain/entities/classes/component';
import { Store } from '../../../domain/services/store';
import { guessClickedComponent } from './concerns/guess-component';

/**
 * References for components
 */
export class ComponentReference implements vscode.ReferenceProvider {

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext
    ): Promise<vscode.Location[] | undefined> {
        let component;

        if (document.languageId === 'php') {
            component = this.findComponentInPhpFile(document, position);
        } else if (document.languageId === 'october-tpl') {
            component = guessClickedComponent(document, position);
        }

        if (!component) {
            return;
        }

        const references = await findComponentUsages(component);

        if (context.includeDeclaration) {
            references.push(new vscode.Location(component.uri, component.classPosition!));
        }

        return references;
    }

    private findComponentInPhpFile(document: vscode.TextDocument, position: vscode.Position) {
        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const clickedRange = document.getWordRangeAtPosition(position, /class\s+\w+\s+extends/);
        if (!clickedRange) {
            return;
        }

        const component = Store.instance.findEntity(document.fileName);
        if (!(component instanceof Component)) {
            return;
        }

        // 5 - length of word "class"
        // 7 - length of word "extends"
        const clickedUqn = document.getText(clickedRange).slice(5, -7).trim();
        if (clickedUqn !== component.uqn) {
            return;
        }

        return component;
    }
}
