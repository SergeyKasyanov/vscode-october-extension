import * as vscode from 'vscode';
import { findEnvUsages } from '../../../domain/entities/concerns/project-env';
import { EnvVariable } from '../../../domain/entities/types';
import { Store } from '../../../domain/services/store';

const ENV_KEY = /[\w\_]+/;

/**
 * Definitions and references for env keys
 */
export class EnvVariableReference implements vscode.ReferenceProvider, vscode.DefinitionProvider {

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext
    ): Promise<vscode.Location[] | undefined> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const envVariables = this.getEnvVariables(document, position);
        if (!envVariables) {
            return;
        }

        return await findEnvUsages(project, envVariables[0], context.includeDeclaration);
    }

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Definition | vscode.DefinitionLink[]> {
        return this.getEnvVariables(document, position)?.map(ev => {
            return {
                targetRange: ev.location.range,
                targetUri: ev.location.uri,
                range: ev.location.range,
                uri: ev.location.uri,
            };
        });
    }

    private getEnvVariables(
        document: vscode.TextDocument,
        position: vscode.Position
    ): EnvVariable[] | undefined {
        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const envKeyRange = document.getWordRangeAtPosition(position, ENV_KEY);
        if (!envKeyRange) {
            return;
        }

        const envKey = document.lineAt(envKeyRange.start.line).text.slice(
            envKeyRange.start.character,
            envKeyRange.end.character
        );

        return project.envVariables.filter(ev => ev.key === envKey);
    }
}
