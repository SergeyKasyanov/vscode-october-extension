import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { Controller } from "../../../domain/entities/classes/controller";
import { Model } from "../../../domain/entities/classes/model";
import { Store } from "../../../domain/services/store";
import { phpSelector } from "../../helpers/file-selectors";

const DIAGNOSTIC_CHECK_BEHAVIOR_CONFIG = 'diagnostic.checkBehaviorConfig';
const COMMAND_ADD_BEHAVIOR_PROPERTY = 'command.addBehaviorProperty';

/**
 * Register check behaviors config diagnostics
 *
 * @param context
 */
export function registerBehaviorsConfigsCheck(context: vscode.ExtensionContext) {
    const behaviorsDiagnostics = vscode.languages.createDiagnosticCollection('behaviorsConfigs');
    context.subscriptions.push(behaviorsDiagnostics);

    subscribeToDocumentChange(context, behaviorsDiagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
        phpSelector,
        new AddBehaviorRequiredProperty,
        { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    ));

    context.subscriptions.push(vscode.commands.registerCommand(
        COMMAND_ADD_BEHAVIOR_PROPERTY,
        addProperty
    ));
}

/**
 * Listen to document changes for update diagnostics collection
 *
 * @param context
 * @param behaviorsDiagnostics
 */
function subscribeToDocumentChange(context: vscode.ExtensionContext, behaviorsDiagnostics: vscode.DiagnosticCollection) {
    if (vscode.window.activeTextEditor) {
        provideDiagnostics(vscode.window.activeTextEditor.document, behaviorsDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            provideDiagnostics(editor.document, behaviorsDiagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => provideDiagnostics(editor.document, behaviorsDiagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => behaviorsDiagnostics.delete(doc.uri)));
}

/**
 * Check if class doesn't have properties required by it's behaviors
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


    const diagnostics: Diagnostic[] = [];

    const entityBehaviors = entity.behaviors;
    const entityProperties = entity.phpClassProperties || {};
    const implementsLoc = entityProperties.implement?.loc;
    if (!implementsLoc) {
        return;
    }

    for (const fqn in entityBehaviors) {
        if (Object.prototype.hasOwnProperty.call(entityBehaviors, fqn)) {
            const beh = entityBehaviors[fqn];

            const requiredProperties = beh.behavior.requiredProperties;

            for (const prop of requiredProperties) {
                const exists = entityProperties[prop];
                if (exists) {
                    continue;
                }

                const start = new vscode.Position(beh.location.start.line - 1, beh.location.start.column);
                const end = new vscode.Position(beh.location.end.line - 1, beh.location.end.column);
                const range = new vscode.Range(start, end);

                const message = `Property ${prop} is required`;

                const diagnostic = new Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
                diagnostic.code = DIAGNOSTIC_CHECK_BEHAVIOR_CONFIG;
                diagnostic.property = prop;
                diagnostic.implementsLocation = implementsLoc;

                diagnostics.push(diagnostic);
            }
        }
    }

    diagnosticsCollection.set(document.uri, diagnostics);
}

/**
 * Provides command for add property required by behavior
 */
class AddBehaviorRequiredProperty implements vscode.CodeActionProvider {

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return (context.diagnostics as Diagnostic[])
            .filter(diagnostic => diagnostic.code === DIAGNOSTIC_CHECK_BEHAVIOR_CONFIG)
            .map(diagnostic => {
                const property = diagnostic.property!;

                const action = new vscode.CodeAction(`Add \$${property} property`);
                action.diagnostics = [diagnostic];
                action.isPreferred = true;
                action.command = {
                    command: COMMAND_ADD_BEHAVIOR_PROPERTY,
                    title: `Add \$${property} property`,
                    arguments: [document, diagnostic]
                };

                return action;
            });
    }
}

/**
 * Add property required by behavior
 */
async function addProperty(document: vscode.TextDocument, diagnostic: Diagnostic) {
    let indent = vscode.workspace.getConfiguration().get('editor.indentSize');
    if (indent === 'tabSize') {
        indent = vscode.workspace.getConfiguration().get('editor.tabSize');
    }

    const eol = document.eol === vscode.EndOfLine.CRLF ? `\r\n` : `\n`;
    const code = eol + ' '.repeat(indent as number) + 'public $' + diagnostic.property + ' = \'\';';

    const edit = new vscode.WorkspaceEdit();
    edit.insert(
        document.uri,
        new vscode.Position(
            diagnostic.implementsLocation!.end.line - 1,
            diagnostic.implementsLocation!.end.column + 1
        ),
        code
    );

    vscode.workspace.applyEdit(edit);
}

/**
 * Extend default diagnostic class for provide additional information
 */
class Diagnostic extends vscode.Diagnostic {
    implementsLocation?: phpParser.Location;
    property?: string;
}
