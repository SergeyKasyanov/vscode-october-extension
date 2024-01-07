import * as vscode from 'vscode';
import { findEventUsages } from '../../../domain/actions/find-event-usages';
import { Event } from '../../../domain/entities/types';
import { Store } from '../../../domain/services/store';

const EVENT_NAME = /[\w\-\_\.\:]+/;

/**
 * Definitions and references for global events
 */
export class EventReference implements vscode.ReferenceProvider, vscode.DefinitionProvider {

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext
    ): Promise<vscode.Location[] | undefined> {
        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const events = this.getEvents(document, position);
        if (!events) {
            return;
        }

        return await findEventUsages(project, events[0], context.includeDeclaration);
    }

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.Definition | vscode.DefinitionLink[]> {
        const events = this.getEvents(document, position);
        if (!events) {
            return [];
        }

        const result: vscode.DefinitionLink[] = [];

        for (const event of events) {
            const uri = vscode.Uri.file(event.filePath);
            const document = await vscode.workspace.openTextDocument(uri);
            const position = document.positionAt(event.offset);
            const range = document.getWordRangeAtPosition(position, EVENT_NAME);
            if (!range) {
                continue;
            }

            result.push({
                targetRange: range,
                targetUri: uri,
            });
        }

        return result;
    }

    private getEvents(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Event[] | undefined {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const eventRange = document.getWordRangeAtPosition(position, EVENT_NAME);
        if (!eventRange) {
            return;
        }

        const event = document.lineAt(eventRange.start.line).text.slice(
            eventRange.start.character,
            eventRange.end.character
        );

        return project.events.filter(ev => ev.name === event);
    }
}
