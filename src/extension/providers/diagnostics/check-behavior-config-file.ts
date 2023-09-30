import * as phpParser from 'php-parser';
import * as vscode from 'vscode';
import { Behavior } from '../../../domain/entities/classes/behavior';
import { Controller } from '../../../domain/entities/classes/controller';
import { Model } from '../../../domain/entities/classes/model';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { PathHelpers } from '../../../domain/helpers/path-helpers';
import { Store } from '../../../domain/services/store';
import { phpSelector } from '../../helpers/file-selectors';
import { Plugin } from '../../../domain/entities/owners/plugin';
import { AppDirectory } from '../../../domain/entities/owners/app-directory';
import { Str } from '../../../helpers/str';
import { Config } from '../../../config';

const DIAGNOSTIC_CHECK_BEHAVIOR_CONFIG_FILE = 'diagnostic.checkBehaviorConfigFile';
const COMMAND_CREATE_BEHAVIOR_CONFIG_FILE = 'command.createBehaviorConfigFile';

export function registerBehaviorConfigFileCheck(context: vscode.ExtensionContext) {
    const diagnostics = vscode.languages.createDiagnosticCollection('behaviorsConfigs');
    context.subscriptions.push(diagnostics);

    subscribeToDocumentChange(context, diagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
        phpSelector,
        new CreateBehaviorConfigFile,
        { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    ));

    context.subscriptions.push(vscode.commands.registerCommand(
        COMMAND_CREATE_BEHAVIOR_CONFIG_FILE,
        createFile
    ));
}

/**
 * Listen to document changes for update diagnostics collection
 *
 * @param context
 * @param diagnostics
 */
function subscribeToDocumentChange(context: vscode.ExtensionContext, diagnostics: vscode.DiagnosticCollection) {
    if (vscode.window.activeTextEditor) {
        provideDiagnostics(vscode.window.activeTextEditor.document, diagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            provideDiagnostics(editor.document, diagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => provideDiagnostics(editor.document, diagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => diagnostics.delete(doc.uri)));
}

/**
 * Check if class behavior config files does not exists
 *
 * @param document
 * @param diagnosticsCollection
 * @returns
 */
function provideDiagnostics(document: vscode.TextDocument, diagnosticsCollection: vscode.DiagnosticCollection) {
    if (!document.fileName.endsWith('.php')) {
        return;
    }

    const entity = Store.instance.findEntity(document.fileName) as Controller | Model;
    if (!(entity instanceof Controller || entity instanceof Model)) {
        return;
    }

    const entityProperties = entity.phpClassProperties;
    if (!entityProperties) {
        return;
    }

    const diagnostics: Diagnostic[] = [];
    const entityBehaviors = entity.behaviors;

    for (const fqn in entityBehaviors) {
        if (Object.prototype.hasOwnProperty.call(entityBehaviors, fqn)) {
            const beh = entityBehaviors[fqn];
            const requiredProperties = beh.behavior.requiredProperties;

            for (const prop of requiredProperties) {
                const property = entityProperties[prop];
                if (!property) {
                    continue;
                }

                if (property.value?.kind === 'string') {
                    const diagnostic = makeDiagnostic(property.value, entity, beh.behavior);
                    if (!diagnostic) {
                        continue;
                    }

                    diagnostics.push(diagnostic);
                } else if (property.value?.kind === 'array') {
                    (property.value as phpParser.Array).items.forEach(_item => {
                        const item = _item as phpParser.Entry;
                        if (item.key?.kind === 'string' && item.value.kind === 'string') {
                            const diagnostic = makeDiagnostic(item.value, entity, beh.behavior);
                            if (!diagnostic) {
                                return;
                            }

                            diagnostics.push(diagnostic);
                        }
                    });
                }
            }
        }
    }

    diagnosticsCollection.set(document.uri, diagnostics);
}

function makeDiagnostic(valueObj: phpParser.Node, entity: Controller | Model, behavior: Behavior) {
    if (!valueObj.loc) {
        return;
    }

    const valueStr = (valueObj as phpParser.String).value;
    if (valueStr.length === 0) {
        return;
    }

    const filePath = PathHelpers.relativePath(entity.owner.project.path, valueStr, entity instanceof Controller ? entity : null);
    if (!filePath || FsHelpers.exists(filePath)) {
        return;
    }

    const start = new vscode.Position(valueObj.loc!.start.line - 1, valueObj.loc.start.column);
    const end = new vscode.Position(valueObj.loc!.end.line - 1, valueObj.loc.end.column);
    const range = new vscode.Range(start, end);

    const message = `File ${valueStr} does not exists`;

    const diagnostic = new Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
    diagnostic.code = DIAGNOSTIC_CHECK_BEHAVIOR_CONFIG_FILE;
    diagnostic.name = valueStr;
    diagnostic.filePath = filePath;
    diagnostic.behavior = behavior;
    diagnostic.entity = entity;

    return diagnostic;
}

/**
 * Provides command for create behavior config
 */
class CreateBehaviorConfigFile implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return (context.diagnostics as Diagnostic[])
            .filter(diagnostic => diagnostic.code === DIAGNOSTIC_CHECK_BEHAVIOR_CONFIG_FILE)
            .map(diagnostic => {
                const action = new vscode.CodeAction(`Create ${diagnostic.name} file`);
                action.diagnostics = [diagnostic];
                action.command = {
                    command: COMMAND_CREATE_BEHAVIOR_CONFIG_FILE,
                    title: `Create ${diagnostic.name} file`,
                    arguments: [diagnostic]
                };

                return action;
            });

    }
}

/**
 * Create config file required by behavior
 */
async function createFile(diagnostic: Diagnostic) {
    let content = '';

    if (diagnostic.entity!.owner instanceof Plugin || diagnostic.entity!.owner instanceof AppDirectory) {
        let contentTemplate;

        switch (diagnostic.behavior!.fqn) {
            case 'Backend\\Behaviors\\ListController':
                contentTemplate = require('../../services/generators/templates/controller/config/list.twig');
                break;
            case 'Backend\\Behaviors\\FormController':
                contentTemplate = require('../../services/generators/templates/controller/config/form.twig');
                break;
            case 'Backend\\Behaviors\\ImportExportController':
                contentTemplate = require('../../services/generators/templates/controller/config/import_export.twig');
                break;
            case 'Backend\\Behaviors\\RelationController':
                contentTemplate = require('../../services/generators/templates/controller/config/relation.twig');
                break;
        }

        if (contentTemplate) {
            const plugin = diagnostic.entity!.owner;
            const templateVars: { [key: string]: string|boolean } = {
                structured: Config.isBackendControllerStructured
            };

            if (diagnostic.entity!.owner instanceof Plugin) {
                templateVars['author'] = diagnostic.entity!.owner.author;
                templateVars['plugin'] = diagnostic.entity!.owner.nameWithoutAuthor;
            } else if (diagnostic.entity!.owner instanceof AppDirectory) {
                templateVars['author'] = '';
                templateVars['plugin'] = diagnostic.entity!.owner.name;
            }

            if (plugin instanceof Plugin) {
                templateVars['namespace'] = Str.pascalCase(plugin.author) + '\\' + Str.pascalCase(plugin.nameWithoutAuthor);
                templateVars['namespace_snake'] = plugin.author.toLowerCase() + '_' + plugin.nameWithoutAuthor.toLowerCase();
                templateVars['namespace_slash'] = plugin.author.toLowerCase() + '/' + plugin.nameWithoutAuthor.toLowerCase();
                templateVars['namespace_dot'] = plugin.author.toLowerCase() + '.' + plugin.nameWithoutAuthor.toLowerCase();
                templateVars['namespace_dot_capital'] = Str.pascalCase(plugin.author) + '.' + Str.pascalCase(plugin.nameWithoutAuthor);
            } else if (plugin instanceof AppDirectory) {
                templateVars['namespace'] = 'App';
                templateVars['namespace_snake'] = 'app';
                templateVars['namespace_slash'] = 'app';
                templateVars['namespace_dot'] = 'app';
                templateVars['namespace_dot_capital'] = 'App';
            }

            const controller = diagnostic.entity!.uqn;

            templateVars['controller_camel'] = Str.camelCase(controller);
            templateVars['controller_pascal'] = Str.pascalCase(controller);
            templateVars['controller_dashed'] = Str.dashedCase(controller);
            templateVars['controller_snake'] = Str.snakeCase(controller);
            templateVars['controller_lower'] = controller.toLowerCase();

            const model = Str.singular(controller);

            templateVars['model_camel'] = Str.camelCase(model);
            templateVars['model_pascal'] = Str.pascalCase(model);
            templateVars['model_dashed'] = Str.dashedCase(model);
            templateVars['model_snake'] = Str.snakeCase(model);
            templateVars['model_lower'] = model.toLowerCase();

            content = contentTemplate(templateVars);
        }

        FsHelpers.writeFile(diagnostic.filePath!, content);

        vscode.window.showTextDocument(vscode.Uri.file(diagnostic.filePath!));
    }
}

/**
 * Extend default diagnostic class for provide additional information
 */
class Diagnostic extends vscode.Diagnostic {
    name?: string;
    filePath?: string;
    behavior?: Behavior;
    entity?: Model | Controller;
}
