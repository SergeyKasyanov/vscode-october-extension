/* eslint-disable @typescript-eslint/naming-convention */
import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { phpSelector } from "../../../helpers/fileSelectors";
import { parsePhp } from "../../../helpers/parsePhp";
import { PluginFileUtils } from "../../../helpers/pluginFileUtils";
import { searchAfter } from "../../helpers/isRightAfter";

const DIAGNOSTIC_CHECK_BEHAVIOR_CONFIG = 'diagnostic.checkBehaviorConfig';

const BEHAVIORS: { [behavior: string]: { property: string, command: string } } = {
    '\\Backend\\Behaviors\\ListController': {
        property: 'listConfig',
        command: 'command.add_behavior_config.ListController'
    },
    '\\Backend\\Behaviors\\FormController': {
        property: 'formConfig',
        command: 'command.add_behavior_config.FormController'
    },
    '\\Backend\\Behaviors\\ImportExportController': {
        property: 'importExportConfig',
        command: 'command.add_behavior_config.ImportExportController'
    },
    '\\Backend\\Behaviors\\RelationController': {
        property: 'relationConfig',
        command: 'command.add_behavior_config.RelationController'
    },
    '\\Backend\\Behaviors\\ReorderController': {
        property: 'reorderConfig',
        command: 'command.add_behavior_config.ReorderController'
    },
};

export function registerBehaviorsConfigsCheck(context: vscode.ExtensionContext) {
    const behaviorsDiagnostics = vscode.languages.createDiagnosticCollection('behaviorsConfigs');
    context.subscriptions.push(behaviorsDiagnostics);

    subscribeToDocumentChange(context, behaviorsDiagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(phpSelector, new AddBehaviorConfigCodeActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));

    for (const behavior in BEHAVIORS) {
        if (Object.prototype.hasOwnProperty.call(BEHAVIORS, behavior)) {
            const behaviorConfig = BEHAVIORS[behavior];

            context.subscriptions.push(vscode.commands.registerCommand(behaviorConfig.command, (document, range) => addBehaviorConfig(behaviorConfig.property, document, range)));
        }
    }
}

function subscribeToDocumentChange(context: vscode.ExtensionContext, behaviorsDiagnostics: vscode.DiagnosticCollection) {
    const checkBehaviorsConfigs = new CheckBehaviorsConfigs();

    if (vscode.window.activeTextEditor) {
        checkBehaviorsConfigs.provideDiagnostics(vscode.window.activeTextEditor.document, behaviorsDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            checkBehaviorsConfigs.provideDiagnostics(editor.document, behaviorsDiagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => checkBehaviorsConfigs.provideDiagnostics(editor.document, behaviorsDiagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => behaviorsDiagnostics.delete(doc.uri)));

}

class AddBehaviorConfigCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return context.diagnostics
            .filter(d => d.code?.toString().startsWith(DIAGNOSTIC_CHECK_BEHAVIOR_CONFIG))
            .map(d => this.createCodeAction(document, d));
    }

    private createCodeAction(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction {
        let behaviorName;
        const behAlias = document.getText(diagnostic.range);

        if (behAlias.startsWith('\\') && behAlias.endsWith('::class')) {
            // fqn
            behaviorName = behAlias.slice(0, -7);
        } else if (behAlias.endsWith('::class')) {
            // uqn
            behaviorName = CheckBehaviorsConfigs.behaviorsAliases[document.fileName][behAlias.slice(0, -7)];
        } else if (behAlias.includes('.')) {
            // dot notation
            behaviorName = '\\' + behAlias.slice(1, -1).replace(/\./g, '\\');
        } else {
            // ??
            behaviorName = behAlias;
        }

        const behaviorConfig = BEHAVIORS[behaviorName];

        if (!behaviorConfig) {
            throw Error('Behavior not recognized');
        }

        const prop = behaviorConfig.property;

        const action = new vscode.CodeAction(`Add \$${prop} property`);
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        action.command = {
            command: behaviorConfig.command,
            title: `Add \$${prop} property`,
            arguments: [document, diagnostic.range]
        };

        return action;
    }
}

class CheckBehaviorsConfigs {

    private document: vscode.TextDocument | undefined;
    private diagnostics: vscode.Diagnostic[] = [];

    public static behaviorsAliases: { [documentUri: string]: { [alias: string]: string } } = {};

    provideDiagnostics(
        document: vscode.TextDocument,
        diagnosticsCollection: vscode.DiagnosticCollection
    ) {
        if (!document.fileName.endsWith('.php')) {
            return;
        }

        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (!['models', 'controllers'].includes(parsed?.directory || '')) {
            return;
        }

        this.document = document;

        try {
            this.diagnostics = [];
            this.fillDiagnostics();
        } catch (err) {
            console.error(err);
        }

        diagnosticsCollection.set(document.uri, this.diagnostics);
    }

    private fillDiagnostics() {
        if (!CheckBehaviorsConfigs.behaviorsAliases[this.document!.fileName]) {
            CheckBehaviorsConfigs.behaviorsAliases[this.document!.fileName] = {};
        }

        const ast = parsePhp(this.document!.getText(), this.document!.fileName);

        const ns = ast.children.find(el => el.kind === 'namespace') as phpParser.Namespace;
        if (!ns) {
            return;
        }

        let modelClass: phpParser.Class | undefined;

        ns.children.forEach(el => {
            if (el.kind === 'usegroup') {
                const items: phpParser.UseItem[] = (el as any).items;

                for (const useItem of items) {
                    let name = useItem.name;

                    if (!name.startsWith('\\')) {
                        name = '\\' + name;
                    }

                    if (!Object.keys(BEHAVIORS).includes(name)) {
                        continue;
                    }

                    if (useItem.alias) {
                        CheckBehaviorsConfigs.behaviorsAliases[this.document!.fileName][useItem.alias.name] = name;
                    } else {
                        const alias = name.split('\\').pop();
                        CheckBehaviorsConfigs.behaviorsAliases[this.document!.fileName][alias!] = name;
                    }
                }
                return;
            }

            if (el.kind === 'class') {
                modelClass = el as phpParser.Class;
            }
        });

        if (!modelClass) {
            return;
        }

        let usedBehaviors: { name: string, loc: phpParser.Location }[] = [];
        let implementLocation: phpParser.Location | undefined;
        let properties: string[] = [];

        modelClass.body.forEach(el => {
            if (el.kind === 'propertystatement') {
                const classProperties = (el as unknown as phpParser.PropertyStatement).properties;
                for (const prop of classProperties) {
                    if (prop.kind === 'property') {
                        const propIdentifier = prop.name as phpParser.Identifier | string;
                        const propName = propIdentifier instanceof Object ? propIdentifier.name : propIdentifier;

                        if (propName === 'implement' && prop.value?.kind === 'array') {
                            implementLocation = el.loc!;

                            (prop.value as phpParser.Array).items.forEach(entry => {
                                const entryValue = (entry as phpParser.Entry).value;

                                if (entryValue.kind === 'string') {
                                    const name = '\\' + (entryValue as phpParser.String).value.replace(/\./g, '\\');

                                    if (Object.keys(BEHAVIORS).includes(name)) {
                                        usedBehaviors.push({
                                            name: name,
                                            loc: entryValue.loc!
                                        });
                                    }
                                } else if (entryValue.kind === 'staticlookup') {
                                    const what = (entryValue as phpParser.StaticLookup).what;

                                    if (what?.kind !== 'name') {
                                        return;
                                    }

                                    const name = (what as phpParser.Name);
                                    const resolution = name.resolution;

                                    if (resolution === 'fqn') {
                                        usedBehaviors.push({
                                            name: name.name,
                                            loc: entryValue.loc!
                                        });
                                    } else if (resolution === 'uqn') {
                                        const beh = CheckBehaviorsConfigs.behaviorsAliases[this.document!.fileName][name.name];
                                        if (!beh) {
                                            return;
                                        }

                                        usedBehaviors.push({
                                            name: beh,
                                            loc: entryValue.loc!
                                        });
                                    }
                                }
                            });
                        } else {
                            properties.push(propName);
                        }
                    }
                }
            }
        });

        if (!implementLocation || usedBehaviors.length === 0) {
            return;
        }

        usedBehaviors.forEach(beh => {
            const behConfig = BEHAVIORS[beh.name];
            if (!behConfig) {
                return;
            }

            const requiredProperty = BEHAVIORS[beh.name].property;
            if (!properties.includes(requiredProperty)) {
                this.diagnostics!.push(this.createDiagnostic(beh.loc, behConfig.property));
            }
        });
    }

    private createDiagnostic(location: phpParser.Location, property: string): vscode.Diagnostic {
        const diagnosticRange = new vscode.Range(
            new vscode.Position(location.start.line - 1, location.start.column),
            new vscode.Position(location.end.line - 1, location.end.column)
        );

        const message = `Property ${property} is required`;

        const diagnostic = new vscode.Diagnostic(diagnosticRange, message, vscode.DiagnosticSeverity.Error);
        diagnostic.code = DIAGNOSTIC_CHECK_BEHAVIOR_CONFIG;

        return diagnostic;
    }
}

async function addBehaviorConfig(property: string, document: vscode.TextDocument, range: vscode.Range) {
    const eol = document.eol === vscode.EndOfLine.CRLF ? `\r\n` : `\n`;
    const code = eol + eol + 'public \\$' + property + ' = \'$0\';';

    let line = range.end.line;
    let char = document.lineAt(range.end.line).text.length;

    const endPos = searchAfter(document, range.end, /\;/);
    if (endPos) {
        line = endPos.line;
        char = document.lineAt(endPos.line).text.length;
    }

    const editor = await vscode.window.showTextDocument(document);

    editor.insertSnippet(
        new vscode.SnippetString(code),
        new vscode.Position(line, char)
    );
}
