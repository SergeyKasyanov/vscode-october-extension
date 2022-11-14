import * as fs from "fs";
import * as vscode from 'vscode';
import { Indexer } from "./domain/services/indexer";
import { OctoberHtmDocumentFormatting } from "./extension/providers/formatting/octoberHtmFormatting";
import { registerCodeActions } from "./extension/register/registerCodeActions";
import { registerCodeLenses } from "./extension/register/registerCodeLenses";
import { registerCommand as registerCommands } from "./extension/register/registerCommands";
import { registerCompletionItemProviders } from "./extension/register/registerCompletionItemProviders";
import { registerDiagnostics } from "./extension/register/registerDiagnostics";
import { registerDocumentLinkProviders } from "./extension/register/registerDocumentLinkProviders";
import { registerFoldingProviders } from "./extension/register/registerFoldingProviders";
import { registerHoverProviders } from "./extension/register/registerHoverProviders";
import { registerListeners } from "./extension/register/registerListeners";
import { octoberTplSelector } from "./helpers/fileSelectors";
import { rootPath } from './helpers/paths';
import { Platform } from "./services/platform";
import { Project } from "./services/project";
import { Themes } from "./services/themes";

export function activate(context: vscode.ExtensionContext) {
    const workspaceOpened = vscode.workspace.workspaceFolders instanceof Array && vscode.workspace.workspaceFolders.length > 0;
    const hasArtisan = fs.existsSync(rootPath('artisan'));

    let ocVersionStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    context.subscriptions.push(ocVersionStatusBarItem);

    let version = Platform.getInstance().getCurrentVersionName();

    if (workspaceOpened && hasArtisan && version) {

        preloadData();

        // activate html features
        vscode.extensions.getExtension('vscode.html-language-features')?.activate();

        ocVersionStatusBarItem.text = `OctoberCMS: ${version}`;
        ocVersionStatusBarItem.command = 'octoberCode.showCommands';

        context.subscriptions.push(vscode.commands.registerCommand('octoberCode.showCommands', () => {
            vscode.commands.executeCommand('workbench.action.quickOpen', '>OctoberCode: ');
        }));

        registerCodeActions(context);
        registerCodeLenses(context);
        registerCommands(context);
        registerCompletionItemProviders(context);
        registerDiagnostics(context);
        registerDocumentLinkProviders(context);
        registerFoldingProviders(context);
        registerHoverProviders(context);
        registerListeners(context);

        context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(octoberTplSelector, new OctoberHtmDocumentFormatting));

    } else {
        ocVersionStatusBarItem.text = `OctoberCMS: not detected`;

        //#region Disable commands

        context.subscriptions.push(vscode.commands.registerCommand('octoberCode.generate', () => sayOctoberNotDetected()));
        context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToConfig', () => sayOctoberNotDetected()));
        context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToClass', () => sayOctoberNotDetected()));
        context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToController', () => sayOctoberNotDetected()));
        context.subscriptions.push(vscode.commands.registerCommand('octoberCode.goToModel', () => sayOctoberNotDetected()));
        context.subscriptions.push(vscode.commands.registerCommand('octoberCode.addModelAttributesToConfig', () => sayOctoberNotDetected()));

        //#endregion
    }

    ocVersionStatusBarItem.show();
}

export function deactivate() { }

function preloadData() {
    const indexer = new Indexer;

    for (const ws of vscode.workspace.workspaceFolders || []) {
        indexer.index(ws);
    }
    // Themes.instance;
    // Project.instance;
}

function sayOctoberNotDetected() {
    vscode.window.showWarningMessage('October CMS not detected');
}
