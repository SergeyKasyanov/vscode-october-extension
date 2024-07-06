import * as vscode from 'vscode';
import { Indexer } from "./domain/services/indexer";
import { disposeWatchers } from './extension/providers/formatting/config/config-watcher';
import { registerCodeActions } from "./extension/register/actions";
import { registerCommands } from "./extension/register/commands";
import { registerCompletions } from "./extension/register/completions";
import { registerDiagnostics } from "./extension/register/diagnostics";
import { registerFormatting } from './extension/register/formatting';
import { registerHovers } from "./extension/register/hovers";
import { registerCodeLenses } from "./extension/register/lenses";
import { registerDocumentLinks } from "./extension/register/links";
import { registerListeners } from "./extension/register/listeners";
import { registerReferences } from './extension/register/references';

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
    registerReferences(context);
    registerFormatting(context);
}

export function deactivate() {
    Indexer.instance.stop();
    disposeWatchers();
}
