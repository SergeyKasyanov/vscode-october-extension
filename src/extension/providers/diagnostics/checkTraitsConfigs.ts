/* eslint-disable @typescript-eslint/naming-convention */
import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { phpSelector } from "../../../helpers/fileSelectors";
import { parsePhp } from "../../../helpers/parsePhp";
import { PluginFileUtils } from "../../../helpers/pluginFileUtils";
import { searchAfter } from "../../helpers/isRightAfter";

const DIAGNOSTIC_CHECK_TRAIT_CONFIG = 'diagnostic.checkTraitConfig';

const TRAITS: { [trait: string]: { property: string, command: string } } = {
    '\\October\\Rain\\Database\\Traits\\Nullable': {
        property: 'nullable',
        command: 'command.add_trait_config.Nullable'
    },
    '\\October\\Rain\\Database\\Traits\\Hashable': {
        property: 'hashable',
        command: 'command.add_trait_config.Hashable'
    },
    '\\October\\Rain\\Database\\Traits\\Purgeable': {
        property: 'purgeable',
        command: 'command.add_trait_config.Purgeable'
    },
    '\\October\\Rain\\Database\\Traits\\Encryptable': {
        property: 'encryptable',
        command: 'command.add_trait_config.Encryptable'
    },
    '\\October\\Rain\\Database\\Traits\\Sluggable': {
        property: 'slugs',
        command: 'command.add_trait_config.Sluggable'
    },
    '\\October\\Rain\\Database\\Traits\\Validation': {
        property: 'rules',
        command: 'command.add_trait_config.Validation'
    },
    '\\October\\Rain\\Database\\Traits\\Revisionable': {
        property: 'revisionable',
        command: 'command.add_trait_config.Revisionable'
    },
};

export function registerTraitsConfigsChecks(context: vscode.ExtensionContext) {
    const traitsDiagnostics = vscode.languages.createDiagnosticCollection('traitsConfigs');
    context.subscriptions.push(traitsDiagnostics);

    subscribeToDocumentChange(context, traitsDiagnostics);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(phpSelector, new AddTraitConfigCodeActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));

    for (const trait in TRAITS) {
        if (Object.prototype.hasOwnProperty.call(TRAITS, trait)) {
            const traitConfig = TRAITS[trait];

            context.subscriptions.push(vscode.commands.registerCommand(traitConfig.command, (document, range) => addTraitConfig(traitConfig.property, document, range)));
        }
    }
}

function subscribeToDocumentChange(context: vscode.ExtensionContext, traitsDiagnostics: vscode.DiagnosticCollection) {
    const checkTraitsConfigs = new CheckTraitsConfigs();

    if (vscode.window.activeTextEditor) {
        checkTraitsConfigs.provideDiagnostics(vscode.window.activeTextEditor.document, traitsDiagnostics);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            checkTraitsConfigs.provideDiagnostics(editor.document, traitsDiagnostics);
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(editor => checkTraitsConfigs.provideDiagnostics(editor.document, traitsDiagnostics)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => traitsDiagnostics.delete(doc.uri)));
}

class CheckTraitsConfigs {

    private document: vscode.TextDocument | undefined;
    private diagnostics: vscode.Diagnostic[] = [];

    public static traitsAliases: { [documentUri: string]: { [alias: string]: string } } = {};

    provideDiagnostics(
        document: vscode.TextDocument,
        diagnosticsCollection: vscode.DiagnosticCollection
    ) {
        if (!document.fileName.endsWith('.php')) {
            return;
        }

        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (parsed?.directory !== 'models') {
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
        if (!CheckTraitsConfigs.traitsAliases[this.document!.fileName]) {
            CheckTraitsConfigs.traitsAliases[this.document!.fileName] = {};
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

                    if (!Object.keys(TRAITS).includes(name)) {
                        continue;
                    }

                    if (useItem.alias) {
                        CheckTraitsConfigs.traitsAliases[this.document!.fileName][useItem.alias.name] = name;
                    } else {
                        const alias = name.split('\\').pop();
                        CheckTraitsConfigs.traitsAliases[this.document!.fileName][alias!] = name;
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

        let modelUsedTraits: { alias: string, loc: phpParser.Location, groupLoc: phpParser.Location }[] = [];
        let properties: string[] = [];

        modelClass.body.forEach(el => {
            if (el.kind === 'traituse') {
                const usedTraits = (el as unknown as phpParser.TraitUse).traits;
                for (const trait of usedTraits) {
                    modelUsedTraits.push({
                        alias: trait.name,
                        loc: trait.loc!,
                        groupLoc: el.loc!
                    });
                }
            }

            if (el.kind === 'propertystatement') {
                const classProperties = (el as unknown as phpParser.PropertyStatement).properties;
                for (const prop of classProperties) {
                    if (prop.kind === 'property') {
                        const propIdentifier = prop.name as phpParser.Identifier | string;
                        const propName = propIdentifier instanceof Object ? propIdentifier.name : propIdentifier;

                        properties.push(propName);
                    }
                }
            }
        });

        if (modelUsedTraits.length === 0) {
            return;
        }

        modelUsedTraits.forEach(usedTrait => {
            const trait = CheckTraitsConfigs.traitsAliases[this.document!.fileName][usedTrait.alias];
            if (!trait) {
                return;
            }

            const traitConfig = TRAITS[trait];
            if (!traitConfig) {
                return;
            }

            const requiredProperty = TRAITS[trait].property;
            if (!properties.includes(requiredProperty)) {
                this.diagnostics.push(this.createDiagnostic(usedTrait.loc, traitConfig.property));
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
        diagnostic.code = DIAGNOSTIC_CHECK_TRAIT_CONFIG;

        return diagnostic;
    }
}

class AddTraitConfigCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        return context.diagnostics
            .filter(d => d.code === DIAGNOSTIC_CHECK_TRAIT_CONFIG)
            .map(d => this.createCodeAction(document, d));
    }

    private createCodeAction(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction {
        const traitAlias = document.getText(diagnostic.range);
        const traitName = CheckTraitsConfigs.traitsAliases[document.fileName][traitAlias];

        const prop = TRAITS[traitName!].property;

        const action = new vscode.CodeAction(`Add \$${prop} property`, vscode.CodeActionKind.QuickFix);
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        action.command = {
            command: TRAITS[traitName!].command,
            title: action.title,
            arguments: [document, diagnostic.range]
        };

        return action;
    }
}

async function addTraitConfig(property: string, document: vscode.TextDocument, range: vscode.Range) {
    let visibility = 'protected';

    if (property === 'rules') {
        visibility = 'public';
    }

    const eol = document.eol === vscode.EndOfLine.CRLF ? `\r\n` : `\n`;
    const code = eol + eol + visibility + ' \\$' + property + ' = [$0];' + eol;

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
