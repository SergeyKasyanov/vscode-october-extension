import * as vscode from 'vscode';
import { Model } from '../../../domain/entities/classes/model';
import { BackendOwner } from '../../../domain/entities/owners/backend-owner';
import { Store } from '../../../domain/services/store';
import { yamlSelector } from '../../helpers/file-selectors';
import { YamlHelpers } from '../../helpers/yaml-helpers';
import { Str } from '../../../helpers/str';

const DIAGNOSTIC_SELECTABLE_OPTIONS_EXISTENCE = 'diagnostic.selectableOptionsExistence';

const COMMAND_ADD_OPTIONS_METHOD = 'command.addOptionsMethod';

const OPTIONS_KEY = /options\:\s*/g;
const SELECTABLE = /type:\s*(dropdown|radio|checkbox|checkboxlist|selectable)/g;

/**
 * Register selectable options existence check
 *
 * @param context
 */
export function registerSelectableOptionsExistenceChecks(context: vscode.ExtensionContext) {
    const selectableOptionsExistenceDiagnostics = vscode.languages.createDiagnosticCollection('selectableOptionsExistence');
    context.subscriptions.push(selectableOptionsExistenceDiagnostics);

    subscribeToDocumentChange(context, selectableOptionsExistenceDiagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(yamlSelector, new AddOptionsMethodActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));

    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_ADD_OPTIONS_METHOD, addMethod));
}

/**
 * Listen to document changes for update diagnostics collection
 *
 * @param context
 * @param selectableOptionsExistenceDiagnostics
 */
function subscribeToDocumentChange(context: vscode.ExtensionContext, selectableOptionsExistenceDiagnostics: vscode.DiagnosticCollection) {
    if (vscode.window.activeTextEditor) {
        provideDiagnostics(vscode.window.activeTextEditor.document, selectableOptionsExistenceDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            provideDiagnostics(editor.document, selectableOptionsExistenceDiagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => provideDiagnostics(editor.document, selectableOptionsExistenceDiagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => selectableOptionsExistenceDiagnostics.delete(doc.uri)));
}

/**
 * Check if mentioned options method exists
 *
 * @param document
 * @param diagnosticsCollection
 */
function provideDiagnostics(
    document: vscode.TextDocument,
    diagnosticsCollection: vscode.DiagnosticCollection
): void {
    const owner = Store.instance.findOwner(document.fileName);
    if (!(owner instanceof BackendOwner)) {
        return;
    }

    const entity = owner.findEntityByRelatedName(document.fileName);

    const diagnostics: vscode.Diagnostic[] = [];

    const optionsMatches = document.getText().matchAll(OPTIONS_KEY);
    for (const match of optionsMatches) {
        const position = document.positionAt(match.index!);
        const modelClass = YamlHelpers.getSibling(document, position, 'modelClass');

        let model: Model | undefined;

        if (modelClass) {
            model = owner.project.models.find(m => m.fqn === modelClass);
        } else if (entity instanceof Model) {
            model = entity;
        }

        if (!model) {
            continue;
        }

        const lineText = document.lineAt(position.line).text;

        const optionsMethod = YamlHelpers.getKeyAndValue(lineText).value;
        if (!optionsMethod || optionsMethod.includes('::')) {
            continue;
        }

        const modelMethods = model.phpClassMethods;
        if (modelMethods && modelMethods[optionsMethod]) {
            continue;
        }

        const start = new vscode.Position(position.line, lineText.indexOf(optionsMethod));
        const end = start.translate(0, optionsMethod.length);
        const range = new vscode.Range(start, end);

        const diagnostic = new Diagnostic(range, `Method ${optionsMethod} not exists in model ${model.uqn}`, vscode.DiagnosticSeverity.Error);
        diagnostic.code = DIAGNOSTIC_SELECTABLE_OPTIONS_EXISTENCE;
        diagnostic.model = model;
        diagnostic.method = optionsMethod;

        diagnostics.push(diagnostic);
    }

    if (entity instanceof Model) {
        const selectableMatches = document.getText().matchAll(SELECTABLE);
        for (const match of selectableMatches) {
            const position = document.positionAt(match.index!);

            const hasOptions = YamlHelpers.getSibling(document, position, 'options');
            if (!(typeof hasOptions === 'undefined')) {
                continue;
            }

            const fieldName = YamlHelpers.getParent(document, position.line);
            if (!fieldName) {
                continue;
            }

            const optionsMethod = 'get' + Str.pascalCase(fieldName) + 'Options';

            if (entity.optionsMethods[optionsMethod]) {
                continue;
            }

            const lineText = document.lineAt(position.line).text;

            const start = new vscode.Position(position.line, lineText.indexOf('type'));
            const end = start.translate(0, match[0].length);
            const range = new vscode.Range(start, end);

            const diagnostic = new Diagnostic(range, `Method ${optionsMethod} not exists in model ${entity.uqn}`, vscode.DiagnosticSeverity.Error);
            diagnostic.code = DIAGNOSTIC_SELECTABLE_OPTIONS_EXISTENCE;
            diagnostic.model = entity;
            diagnostic.method = optionsMethod;

            diagnostics.push(diagnostic);
        }
    }

    diagnosticsCollection.set(document.uri, diagnostics);
}

/**
 * Provies command for add options method to model
 */
class AddOptionsMethodActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return (context.diagnostics as Diagnostic[])
            .filter(diagnostic => diagnostic.code?.toString() === DIAGNOSTIC_SELECTABLE_OPTIONS_EXISTENCE)
            .map(diagnostic => {
                const action = new vscode.CodeAction('Add options method', vscode.CodeActionKind.QuickFix);
                action.diagnostics = [diagnostic];
                action.isPreferred = true;
                action.command = {
                    command: COMMAND_ADD_OPTIONS_METHOD,
                    title: 'Add options method',
                    arguments: [diagnostic]
                };

                return action;
            });
    }
}

/**
 * Add options method to model
 *
 * @param diagnostic
 */
async function addMethod(diagnostic: Diagnostic) {
    if (!diagnostic.model || !diagnostic.method) {
        return;
    }

    const line = diagnostic.model.phpClass!.loc!.end.line - 1;

    const snippet = new vscode.SnippetString(`
    public function ${diagnostic.method}()
    {
        return \${0:[]};
    }
`);

    vscode.window.showTextDocument(vscode.Uri.file(diagnostic.model.path)).then(editor => {
        editor.insertSnippet(snippet, new vscode.Position(line, 0));
    });
}

/**
 * Extend default diagnostic class for provide additional information
 */
class Diagnostic extends vscode.Diagnostic {
    model?: Model;
    method?: string;
}
