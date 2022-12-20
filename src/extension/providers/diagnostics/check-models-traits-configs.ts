/* eslint-disable @typescript-eslint/naming-convention */
import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { Model } from "../../../domain/entities/classes/model";
import { Store } from "../../../domain/services/store";
import { phpSelector } from "../../helpers/file-selectors";

const DIAGNOSTIC_CHECK_TRAIT_CONFIG = 'diagnostic.checkTraitConfig';
const COMMAND_ADD_TRAIT_PROPERTY = 'command.addTraitConfig';

const TRAITS_PROPERTIES: { [string: string]: string } = {
    'October\\Rain\\Database\\Traits\\Nullable': 'nullable',
    'October\\Rain\\Database\\Traits\\Hashable': 'hashable',
    'October\\Rain\\Database\\Traits\\Purgeable': 'purgeable',
    'October\\Rain\\Database\\Traits\\Encryptable': 'encryptable',
    'October\\Rain\\Database\\Traits\\Sluggable': 'slugs',
    'October\\Rain\\Database\\Traits\\Validation': 'rules',
    'October\\Rain\\Database\\Traits\\Revisionable': 'revisionable',
    'October\\Rain\\Database\\Traits\\Multisite': 'propagatable',
};

/**
 * Register check trait required property diagnostic
 *
 * @param context
 */
export function registerModelTraitConfigsCheck(context: vscode.ExtensionContext) {
    const traitsDiagnostics = vscode.languages.createDiagnosticCollection('traitsConfigs');
    context.subscriptions.push(traitsDiagnostics);

    subscribeToDocumentChange(context, traitsDiagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
        phpSelector,
        new AddTraitConfigCodeActionProvider,
        { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    ));

    context.subscriptions.push(vscode.commands.registerCommand(
        COMMAND_ADD_TRAIT_PROPERTY,
        addProperty
    ));
}

/**
 * Listen to document changes for update diagnostics collection
 *
 * @param context
 * @param traitsDiagnostics
 */
function subscribeToDocumentChange(context: vscode.ExtensionContext, traitsDiagnostics: vscode.DiagnosticCollection) {
    if (vscode.window.activeTextEditor) {
        provideDiagnostics(vscode.window.activeTextEditor.document, traitsDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            provideDiagnostics(editor.document, traitsDiagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => provideDiagnostics(editor.document, traitsDiagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => traitsDiagnostics.delete(doc.uri)));
}

/**
 * Check if model class doesn't have properties required by it's traits
 *
 * @param document
 * @param diagnosticsCollection
 * @returns
 */
function provideDiagnostics(document: vscode.TextDocument, diagnosticsCollection: vscode.DiagnosticCollection) {
    if (!document.fileName.endsWith('.php')) {
        return;
    }

    const model = Store.instance.findEntity(document.fileName) as Model;
    if (!(model instanceof Model)) {
        return;
    }

    const diagnostics: Diagnostic[] = [];

    const traits = model.traits || [];
    const properties = model.phpClassProperties || {};

    for (const tr of traits) {
        const requiredProperty = TRAITS_PROPERTIES[tr.traitFqn];
        if (!requiredProperty) {
            continue;
        }

        const classProperty = properties[requiredProperty];
        if (classProperty) {
            continue;
        }

        const start = new vscode.Position(tr.location.start.line - 1, tr.location.start.column);
        const end = new vscode.Position(tr.location.end.line - 1, tr.location.end.column);
        const range = new vscode.Range(start, end);

        const message = `Property ${requiredProperty} is required`;

        const diagnostic = new Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
        diagnostic.code = DIAGNOSTIC_CHECK_TRAIT_CONFIG;
        diagnostic.traitLocation = tr.location;
        diagnostic.property = requiredProperty;

        diagnostics.push(diagnostic);
    }

    diagnosticsCollection.set(document.uri, diagnostics);
}

/**
 * Provides command for add property required by trait
 */
class AddTraitConfigCodeActionProvider implements vscode.CodeActionProvider {

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return (context.diagnostics as Diagnostic[])
            .filter(diagnostic => diagnostic.code === DIAGNOSTIC_CHECK_TRAIT_CONFIG)
            .map(diagnostic => {
                const property = diagnostic.property!;

                const action = new vscode.CodeAction(`Add \$${property} property`);
                action.diagnostics = [diagnostic];
                action.isPreferred = true;
                action.command = {
                    command: COMMAND_ADD_TRAIT_PROPERTY,
                    title: `Add \$${property} property`,
                    arguments: [document, diagnostic]
                };

                return action;
            });
    }
}

async function addProperty(document: vscode.TextDocument, diagnostic: Diagnostic) {
    let indent = vscode.workspace.getConfiguration().get('editor.indentSize');
    if (indent === 'tabSize') {
        indent = vscode.workspace.getConfiguration().get('editor.tabSize');
    }

    let visibility = 'protected';
    if (diagnostic.property === 'rules') {
        visibility = 'public';
    }

    const eol = document.eol === vscode.EndOfLine.CRLF ? `\r\n` : `\n`;
    const code = eol + ' '.repeat(indent as number) + visibility + ' $' + diagnostic.property + ' = [];';

    const edit = new vscode.WorkspaceEdit();
    edit.insert(
        document.uri,
        new vscode.Position(
            diagnostic.traitLocation!.end.line - 1,
            diagnostic.traitLocation!.end.column + 1
        ),
        code
    );

    vscode.workspace.applyEdit(edit);
}

class Diagnostic extends vscode.Diagnostic {
    traitLocation?: phpParser.Location;
    property?: string;
}
