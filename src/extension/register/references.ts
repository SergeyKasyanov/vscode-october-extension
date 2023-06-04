import * as vscode from 'vscode';
import { envSelector, octoberTplSelector, phpSelector, yamlSelector } from '../helpers/file-selectors';
import { BlueprintReference } from '../providers/references/blueprint-reference';
import { ContentReference } from '../providers/references/content-reference';
import { EnvVariableReference } from '../providers/references/env-variable-reference';
import { LayoutReference } from '../providers/references/layout-reference';
import { PageReference } from '../providers/references/page-reference';
import { PartialReference } from '../providers/references/partial-reference';

export function registerReferences(context: vscode.ExtensionContext) {
    register(context, [octoberTplSelector], new LayoutReference());
    register(context, [octoberTplSelector], new PageReference());
    register(context, [octoberTplSelector], new PartialReference());
    register(context, [octoberTplSelector], new ContentReference());

    register(context, [envSelector, phpSelector, octoberTplSelector], new EnvVariableReference());

    register(context, [octoberTplSelector, yamlSelector], new BlueprintReference());
}

function register(
    context: vscode.ExtensionContext,
    selectors: vscode.DocumentFilter[],
    provider: vscode.ReferenceProvider & vscode.DefinitionProvider
) {
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            selectors,
            provider
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            selectors,
            provider
        )
    );
}
