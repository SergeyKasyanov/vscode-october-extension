import { Method } from 'php-parser';
import * as vscode from 'vscode';
import { ControllerBehavior } from '../../../domain/entities/classes/behavior';
import { Controller } from '../../../domain/entities/classes/controller';
import { Widget } from '../../../domain/entities/classes/widget';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { Store } from '../../../domain/services/store';

const GET_EVENT_HANDLER_CALL = /->getEventHandler\s*\(\s*[\'\"][\w\_]+[\'\"]/g;
const ATTRIBUTE_HANDLER = /data-(request|handler)=[\'\"][\w\_]+[\'\"]/g;
const QUOTED_NAME = /[\'\"][\w\_]+[\'\"]/;

/**
 * Definitions of ajax handlers:
 * - $this->getEventHandler('...') in widgets
 * - data-request="..." in controllers views
 * - data-handler="..." in controllers views
 */
export class AjaxHandler implements vscode.DefinitionProvider {

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

        if (entity instanceof Widget || entity instanceof Controller) {
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
