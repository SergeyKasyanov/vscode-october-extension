import * as vscode from 'vscode';
import { octoberTplSelector } from '../helpers/file-selectors';
import { ContentReference } from '../providers/references/content-reference';
import { LayoutReference } from '../providers/references/layout-reference';
import { PageReference } from '../providers/references/page-reference';
import { PartialReference } from '../providers/references/partial-reference';

export function registerReferences(context: vscode.ExtensionContext) {
    register(context, octoberTplSelector, new LayoutReference());
    register(context, octoberTplSelector, new PageReference());
    register(context, octoberTplSelector, new PartialReference());
    register(context, octoberTplSelector, new ContentReference());
}

function register(
    context: vscode.ExtensionContext,
    selector: vscode.DocumentFilter,
    provider: vscode.ReferenceProvider & vscode.DefinitionProvider
) {
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            selector,
            provider
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            selector,
            provider
        )
    );
}
