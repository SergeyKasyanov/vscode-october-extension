import * as vscode from 'vscode';
import { envSelector, octoberTplSelector, phpSelector, yamlSelector } from '../helpers/file-selectors';
import { BackendAjaxHandler } from '../providers/references/backend-ajax-handler';
import { BlueprintReference } from '../providers/references/blueprint-reference';
import { ComponentReference } from '../providers/references/component-reference';
import { ContentReference } from '../providers/references/content-reference';
import { EnvVariableReference } from '../providers/references/env-variable-reference';
import { EventReference } from '../providers/references/event-reference';
import { LayoutReference } from '../providers/references/layout-reference';
import { ModelReference } from '../providers/references/model-reference';
import { PageReference } from '../providers/references/page-reference';
import { PartialReference } from '../providers/references/partial-reference';
import { ComponentDefinition } from '../providers/references/component-definition';

export function registerReferences(context: vscode.ExtensionContext) {
    register(context, [octoberTplSelector], new LayoutReference());
    register(context, [octoberTplSelector], new PageReference());
    register(context, [octoberTplSelector], new PartialReference());
    register(context, [octoberTplSelector], new ContentReference());

    register(context, [envSelector, phpSelector, octoberTplSelector], new EnvVariableReference());
    register(context, [phpSelector], new EventReference());
    register(context, [phpSelector], new BackendAjaxHandler());

    register(context, [octoberTplSelector, yamlSelector], new BlueprintReference());

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            octoberTplSelector,
            new ComponentDefinition()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            [phpSelector, octoberTplSelector],
            new ComponentReference()
        )
    );

    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(
            phpSelector,
            new ModelReference()
        )
    );
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
