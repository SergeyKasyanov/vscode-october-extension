import * as vscode from "vscode";
import { octoberTplSelector, phpSelector, yamlSelector } from "../helpers/file-selectors";
import { BlueprintHandle as IniBlueprintHandle } from "../providers/completions/ini/blueprint-handle";
import { ComponentName } from "../providers/completions/ini/component-name";
import { ComponentProperty as IniComponentProperty } from "../providers/completions/ini/component-property";
import { IniProperty } from "../providers/completions/ini/ini-property";
import { LayoutName } from "../providers/completions/ini/layout-name";
import { AttributeCast } from "../providers/completions/php/attribute-cast";
import { BackendUrl } from "../providers/completions/php/backend-url";
import { BehaviorConfigPath } from "../providers/completions/php/behavior-config-path";
import { BehaviorName } from "../providers/completions/php/behavior-name";
import { CommandCode } from "../providers/completions/php/command-code";
import { ComponentProperty as PhpComponentProperty } from "../providers/completions/php/component-property";
import { ConfigKey } from "../providers/completions/php/config-key";
import { ControllerAction } from "../providers/completions/php/controller-action";
import { EnvVariable } from "../providers/completions/php/env-variable";
import { Icon as PhpIcon } from "../providers/completions/php/icon";
import { LangKey } from "../providers/completions/php/lang-key";
import { ListName } from "../providers/completions/php/list-name";
import { MenuContext } from "../providers/completions/php/menu-context";
import { ModelAttribute as PhpModelAttribute } from "../providers/completions/php/model-attribute";
import { PageName as PageNamePhp } from "../providers/completions/php/page-name";
import { PartialName as BackendPartialName } from "../providers/completions/php/partial-name";
import { PathHelper } from "../providers/completions/php/path-helper";
import { Permission as PhpPermissions } from "../providers/completions/php/permission";
import { RelationName as PhpRelationName } from "../providers/completions/php/relation-name";
import { ValidationRule } from "../providers/completions/php/validation-rule";
import { ValidationTableName } from "../providers/completions/php/validation-table-name";
import { ViewTemplate } from "../providers/completions/php/view-template";
import { AjaxMethod } from "../providers/completions/twig/ajax-method";
import { ComponentArgument } from "../providers/completions/twig/component-argument";
import { ComponentName as RenderComponent } from "../providers/completions/twig/component-name";
import { ContentArguments } from "../providers/completions/twig/content-arguments";
import { ContentName } from "../providers/completions/twig/content-name";
import { EchoStatement } from "../providers/completions/twig/echo-statement";
import { PageName } from "../providers/completions/twig/page-name";
import { PartialArgument } from "../providers/completions/twig/partial-argument";
import { PartialName as FrontendPartialName } from "../providers/completions/twig/partial-name";
import { PlaceholderName } from "../providers/completions/twig/placeholder-name";
import { TwigFilter } from "../providers/completions/twig/twig-filter";
import { TwigTag } from "../providers/completions/twig/twig-tag";
import { TwigTest } from "../providers/completions/twig/twig-test";
import { BlueprintHandle as YamlBlueprintHandle } from "../providers/completions/yaml/blueprint-handle";
import { FilePath } from "../providers/completions/yaml/file-path";
import { Icon as YamlIcon } from "../providers/completions/yaml/icon";
import { MigrationName } from "../providers/completions/yaml/migration-name";
import { ModelAttribute as YamlModelAttribute } from "../providers/completions/yaml/model-attribute";
import { ModelFqn } from "../providers/completions/yaml/model-fqn";
import { Permission as YamlPermission } from "../providers/completions/yaml/permission";
import { RecordUrl } from "../providers/completions/yaml/record-url";
import { RelationName as YamlRelationName } from "../providers/completions/yaml/relation-name";
import { ScopeMethod } from "../providers/completions/yaml/scope-method";
import { SelectableOptions } from "../providers/completions/yaml/selectable-options";
import { TabName } from "../providers/completions/yaml/tab-name";

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const QUOTES = ['\'', '"'];

export function registerCompletions(context: vscode.ExtensionContext) {
    ini(context);
    php(context);
    twig(context);
    yaml(context);
}

function ini(context: vscode.ExtensionContext) {
    register(context, octoberTplSelector, new ComponentName, '[');
    register(context, octoberTplSelector, new IniComponentProperty, ...ALPHABET);
    register(context, octoberTplSelector, new IniProperty, ...ALPHABET);
    register(context, octoberTplSelector, new LayoutName, "'", '"');
    register(context, octoberTplSelector, new IniBlueprintHandle, "'", '"');
}

function php(context: vscode.ExtensionContext) {
    register(context, phpSelector, new AttributeCast, ...QUOTES);
    register(context, phpSelector, new BackendPartialName, ...QUOTES, '/', '~', '$');
    register(context, phpSelector, new BehaviorConfigPath, ...QUOTES, '/', '~', '$');
    register(context, phpSelector, new BehaviorName, ...QUOTES);
    register(context, phpSelector, new ControllerAction, ...QUOTES);
    register(context, phpSelector, new PhpIcon, ...QUOTES);
    register(context, phpSelector, new ListName, ...QUOTES);
    register(context, phpSelector, new MenuContext, ...QUOTES);
    register(context, phpSelector, new PhpComponentProperty, ...QUOTES);
    register(context, phpSelector, new PhpModelAttribute, ...QUOTES);
    register(context, phpSelector, new PhpPermissions, ...QUOTES);
    register(context, phpSelector, new PhpRelationName, ...QUOTES);
    register(context, phpSelector, new PathHelper, ...QUOTES, '/');
    register(context, phpSelector, new CommandCode, '"', "'");

    register(context, [phpSelector, octoberTplSelector], new BackendUrl, ...QUOTES);
    register(context, [phpSelector, octoberTplSelector], new ConfigKey, ...QUOTES);
    register(context, [phpSelector, octoberTplSelector], new EnvVariable, ...QUOTES);
    register(context, [phpSelector, octoberTplSelector], new LangKey, ...QUOTES);
    register(context, [phpSelector, octoberTplSelector], new ValidationRule, ...QUOTES, '|');
    register(context, [phpSelector, octoberTplSelector], new ValidationTableName, ...QUOTES, ':');
    register(context, [phpSelector, octoberTplSelector], new ViewTemplate, ...QUOTES);

    register(context, octoberTplSelector, new PageNamePhp, ...QUOTES);
}

function twig(context: vscode.ExtensionContext) {
    register(context, octoberTplSelector, new AjaxMethod, ...QUOTES);
    register(context, octoberTplSelector, new ComponentArgument, ' ');
    register(context, octoberTplSelector, new ContentArguments, ' ');
    register(context, octoberTplSelector, new ContentName, ...QUOTES);
    register(context, octoberTplSelector, new EchoStatement, ' ', '(');
    register(context, octoberTplSelector, new FrontendPartialName, ...QUOTES);
    register(context, octoberTplSelector, new PageName, ...QUOTES);
    register(context, octoberTplSelector, new PartialArgument, ' ');
    register(context, octoberTplSelector, new PlaceholderName, ' ');
    register(context, octoberTplSelector, new RenderComponent, ...QUOTES);
    register(context, octoberTplSelector, new TwigFilter, '|', ' ');
    register(context, octoberTplSelector, new TwigTag, '%', ' ');
    register(context, octoberTplSelector, new TwigTest, ' ');
}

function yaml(context: vscode.ExtensionContext) {
    register(context, yamlSelector, new FilePath, ' ', '/', '~', '$');
    register(context, yamlSelector, new MigrationName, ' ');
    register(context, yamlSelector, new ModelFqn, ' ');
    register(context, yamlSelector, new ScopeMethod, ' ');
    register(context, yamlSelector, new SelectableOptions, ' ');
    register(context, yamlSelector, new YamlModelAttribute, ' ');
    register(context, yamlSelector, new YamlPermission, ' ');
    register(context, yamlSelector, new YamlRelationName, ' ');
    register(context, yamlSelector, new TabName, ' ');
    register(context, yamlSelector, new RecordUrl, ' ');

    register(context, yamlSelector, new YamlIcon, ' ');
    register(context, yamlSelector, new YamlBlueprintHandle, ' ');
}

function register(
    context: vscode.ExtensionContext,
    selector: vscode.DocumentSelector,
    provider: vscode.CompletionItemProvider,
    ...triggerCharacters: string[]
) {
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            selector,
            provider,
            ...triggerCharacters
        )
    );
}
