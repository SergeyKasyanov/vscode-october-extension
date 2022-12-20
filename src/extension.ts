import * as vscode from 'vscode';
import { Indexer } from "./domain/services/indexer";
import { OctoberTplDocumentFormatting } from "./extension/providers/formatting/october-tpl";
import { registerCodeActions } from "./extension/register/actions";
import { registerCodeLenses } from "./extension/register/lenses";
import { registerCommands } from "./extension/register/commands";
import { registerCompletions } from "./extension/register/completions";
import { registerDiagnostics } from "./extension/register/diagnostics";
import { registerDocumentLinks } from "./extension/register/links";
import { registerHovers } from "./extension/register/hovers";
import { registerListeners } from "./extension/register/listeners";
import { octoberTplSelector } from "./extension/helpers/file-selectors";

export function activate(context: vscode.ExtensionContext) {
    Indexer.instance.start();

    // activate html features
    vscode.extensions.getExtension('vscode.html-language-features')?.activate();

    registerCodeActions(context);
    registerCodeLenses(context);
    registerCommands(context);
    registerCompletions(context);
    registerDiagnostics(context);
    registerDocumentLinks(context);
    registerHovers(context);
    registerListeners(context);

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            octoberTplSelector,
            new OctoberTplDocumentFormatting
        )
    );
}

export function deactivate() {
    Indexer.instance.stop();
}
