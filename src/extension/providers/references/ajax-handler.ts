import { Method } from 'php-parser';
import * as vscode from 'vscode';
import { ControllerBehavior } from '../../../domain/entities/classes/behavior';
import { Controller } from '../../../domain/entities/classes/controller';
import { Widget } from '../../../domain/entities/classes/widget';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { Store } from '../../../domain/services/store';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import path = require('path');

const GET_EVENT_HANDLER_CALL = /->getEventHandler\s*\(\s*[\'\"][\w\_]+[\'\"]/g;
const ATTRIBUTE_HANDLER = /data-(request|handler)=[\'\"][\w\_]+[\'\"]/g;
const QUOTED_NAME = /[\'\"][\w\_]+[\'\"]/;

/**
 * Definitions of ajax handlers:
 * - $this->getEventHandler('...') in widgets
 * - data-request="..." in controllers views
 * - data-handler="..." in controllers views
 */
export class AjaxHandler implements vscode.ReferenceProvider, vscode.DefinitionProvider {

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext
    ): Promise<vscode.Location[] | undefined> {

        const entity = Store.instance.findEntity(document.fileName) as Widget | Controller;

        if (entity instanceof Widget) {
            const ajaxMethod = this.getAjaxMethodName(document, position, entity);
            if (!ajaxMethod) {
                return;
            }

            const files = [
                document.fileName,
                ...FsHelpers.listFiles(entity.filesDirectory, true, ['htm', 'php']).map(
                    file => path.join(entity.filesDirectory, file)
                )
            ];

            const usageRegex = new RegExp(`->getEventHandler\\s*\\(\\s*[\\'\\"]${ajaxMethod}[\\'\\"]`, 'g');

            return this.findUsages(files, ajaxMethod, usageRegex);
        } else if (entity instanceof Controller) {
            const ajaxMethod = this.getAjaxMethodName(document, position, entity);
            if (!ajaxMethod) {
                return;
            }

            const files = FsHelpers.listFiles(entity.filesDirectory, true, ['htm', 'php']).map(
                file => path.join(entity.filesDirectory, file)
            );

            const usageRegex = new RegExp(`data-(request|handler)=[\\'\\"]${ajaxMethod}[\\'\\"]`, 'g');

            return this.findUsages(files, ajaxMethod, usageRegex);
        }
    }

    private getAjaxMethodName(
        document: vscode.TextDocument,
        position: vscode.Position,
        entity: Widget | Controller
    ): string | undefined {
        const ajaxMethodRange = document.getWordRangeAtPosition(position);
        if (!ajaxMethodRange) {
            return;
        }

        const ajaxMethod = document.lineAt(ajaxMethodRange.start.line).text.slice(
            ajaxMethodRange.start.character,
            ajaxMethodRange.end.character
        );

        if (ajaxMethod.startsWith('on')) {
            return ajaxMethod;
        }

        if (entity instanceof Controller && ajaxMethod.includes('_on')) {
            return 'on' + ajaxMethod.split('_on', 2)[1];
        }
    }

    private async findUsages(files: string[], ajaxMethod: string, usageRegex: RegExp) {
        const locations = [];

        const quotedRegex = new RegExp(`[\\'\\"]${ajaxMethod}[\\'\\"]`);

        for (const filePath of files) {
            const fileContent = FsHelpers.readFile(filePath);

            const callMatches = [...fileContent.matchAll(usageRegex)];
            if (callMatches.length === 0) {
                continue;
            }

            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);

            for (const match of callMatches) {
                const qName = match[0]!.match(quotedRegex);
                const start = document.positionAt(match.index! + qName!.index! + 1);
                const end = start.translate(0, ajaxMethod.length);
                const range = new vscode.Range(start, end);

                locations.push(new vscode.Location(uri, range));
            }
        }

        return locations;
    }

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {

        const owner = Store.instance.findOwner(document.fileName) as BackendOwner;
        if (!owner) {
            return;
        }

        const entity = owner.findEntityByRelatedName(document.fileName) as Widget | Controller;
        const result: vscode.DefinitionLink[] = [];

        if (entity instanceof Widget) {
            const ajaxMethodRange = document.getWordRangeAtPosition(position, GET_EVENT_HANDLER_CALL);
            if (!ajaxMethodRange) {
                return;
            }

            result.push(...this.getTargets(document, entity, ajaxMethodRange));
        } else if (entity instanceof Controller) {
            const ajaxMethodRange = document.getWordRangeAtPosition(position, ATTRIBUTE_HANDLER);
            if (!ajaxMethodRange) {
                return;
            }

            result.push(...this.getTargets(document, entity, ajaxMethodRange));

            const behaviors = Object.values(entity.behaviors).map(b => b.behavior);
            for (const beh of behaviors) {
                result.push(...this.getTargets(document, beh, ajaxMethodRange));
            }
        }

        return result;
    }

    private getTargets(
        document: vscode.TextDocument,
        entity: Widget | Controller | ControllerBehavior,
        ajaxMethodRange: vscode.Range
    ): vscode.LocationLink[] {
        const ajaxMethod = document.lineAt(ajaxMethodRange.start.line).text.slice(
            ajaxMethodRange.start.character,
            ajaxMethodRange.end.character
        ).match(QUOTED_NAME)?.[0].slice(1, -1)!;

        const methods = entity.phpClassMethods;
        if (!methods) {
            return [];
        }

        const result = [];

        if (entity instanceof Widget) {
            const handler = methods[ajaxMethod];

            if (handler) {
                result.push({
                    targetUri: entity.uri,
                    targetRange: this.locToRange(handler)
                });
            }
        } else {
            const handler = methods[ajaxMethod];

            if (handler) {
                result.push({
                    targetUri: entity.uri,
                    targetRange: this.locToRange(handler)
                });
            } else {
                for (const methName in methods) {
                    if (Object.prototype.hasOwnProperty.call(methods, methName)) {
                        if (methName.includes('_' + ajaxMethod)) {
                            const handler = methods[methName];

                            result.push({
                                targetUri: entity.uri,
                                targetRange: this.locToRange(handler)
                            });
                        }
                    }
                }
            }
        }

        return result;
    }

    private locToRange(handler: Method) {
        return new vscode.Range(
            new vscode.Position(handler.loc!.start.line - 1, handler.loc!.start.column),
            new vscode.Position(handler.loc!.start.line - 1, handler.loc!.start.column)
        );
    }
}
