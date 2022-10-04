import * as vscode from "vscode";
import { alphabet, quotes } from "../../helpers/completionTriggers";
import { octoberTplSelector, phpSelector, yamlSelector } from "../../helpers/fileSelectors";
import { MailTemplateCompletionItemProvider } from "../providers/completions/mailTemplateCompletionItemProvider";
import { PhpEnvCompletionItemProvider } from "../providers/completions/pluginsPhp/phpEnvCompletionItemProvider";
import { PhpValidationRuleCompletionItemProvider } from "../providers/completions/phpValidationRuleCompletionItemProvider";
import { PhpComponentPropertyCompletionItemProvider } from "../providers/completions/pluginsPhp/phpComponentPropertyCompletionItemProvider";
import { PhpConfigCompletionItemProvider } from "../providers/completions/pluginsPhp/phpConfigCompletionItemProvider";
import { PhpControllerBehaviorConfigPathCompletionItemProvider } from "../providers/completions/pluginsPhp/phpControllerBehaviorConfigPathCompletionItemProvider";
import { PhpMakePartialCompletionItemProvider } from "../providers/completions/pluginsPhp/phpMakePartialCompletionItemProvider";
import { PhpModelPropertiesAttributesCompletionItemProvider } from "../providers/completions/pluginsPhp/phpModelPropertiesAttributesCompletionItemProvider";
import { PhpPermissionCompletionItemProvider } from "../providers/completions/pluginsPhp/phpPermissionCompletionItemProvider";
import { PhpSetContextCompletionItemProvider } from "../providers/completions/pluginsPhp/phpSetContextCompletionItemProvider";
import { IniComponentCompletionItemProvider } from "../providers/completions/themeIni/iniComponentCompletionItemProvider";
import { IniComponentPropertyCompletionItemProvider } from "../providers/completions/themeIni/iniComponentPropertyCompletionItemProvider";
import { IniLayoutCompletionItemProvider } from "../providers/completions/themeIni/iniLayoutCompletionItemProvider";
import { IniPropertyCompletionItemProvider } from "../providers/completions/themeIni/iniPropertyCompletionItemProvider";
import { PhpPageCompletionItemProvider } from "../providers/completions/themePhp/phpPageCompletionItemProvider";
import { TwigAjaxMethodCompletionItemProvider } from "../providers/completions/themeTwig/twigAjaxMethodCompletionItemProvider";
import { TwigComponentCompletionItemProvider } from "../providers/completions/themeTwig/twigComponentCompletionItemProvider";
import { TwigComponentPropertiesCompletionItemProvider } from "../providers/completions/themeTwig/twigComponentPropertiesCompletionItemProvider";
import { TwigContentCompletionItemProvider } from "../providers/completions/themeTwig/twigContentCompletionItemProvider";
import { TwigContentVarsCompletionItemProvider } from "../providers/completions/themeTwig/twigContentVarsCompletionItemProvider";
import { TwigEchoCompletionItemProvider } from "../providers/completions/themeTwig/twigEchoCompletionItemProvider";
import { TwigFilterCompletionItemProvider } from "../providers/completions/themeTwig/twigFilterCompletionItemProvider";
import { TwigPageCompletionItemProvider } from "../providers/completions/themeTwig/twigPageCompletionItemProvider";
import { TwigPartialCompletionItemProvider } from "../providers/completions/themeTwig/twigPartialCompletionItemProvider";
import { TwigPartialVarsCompletionItemProvider } from "../providers/completions/themeTwig/twigPartialVarsCompletionItemProvider";
import { TwigPlaceholdersCompletionItemProvider } from "../providers/completions/themeTwig/twigPlaceholdersCompletionItemProvider";
import { TwigTagCompletionItemProvider } from "../providers/completions/themeTwig/twigTagCompletionItemProvider";
import { TwigTestCompletionItemProvider } from "../providers/completions/themeTwig/twigTestCompletionItemProvider";
import { YamlColumnRelationCompletionItemProvider } from "../providers/completions/yaml/yamlColumnRelationCompletionItemProvider";
import { YamlMigrationNamesCompletionItemProvider } from "../providers/completions/yaml/yamlMigrationNamesCompletionItemProvider";
import { YamlModelClassCompletionItemProvider } from "../providers/completions/yaml/yamlModelClassCompletionItemProvider";
import { YamlOptionsCompletionItemProvider } from "../providers/completions/yaml/yamlOptionsCompletionItemProvider";
import { YamlPathsCompletionItemProvider } from "../providers/completions/yaml/yamlPathsCompletionItemProvider";
import { YamlPermissionsCompletionItemProvider } from "../providers/completions/yaml/yamlPermissionsCompletionItemProvider";
import { YamlScopesCompletionItemProvider } from "../providers/completions/yaml/yamlScopeCompletionItemProvider";
import { PhpControllerActionUrlCompletionItemProvider } from "../providers/completions/pluginsPhp/phpControllerActionUrlCompletionItemProvider";
import { PhpPluginIconCompletionItemProvider } from "../providers/completions/pluginsPhp/phpPluginIconCompletionItemProvider";
import { PhpRelationRenderCompletionItemProvider } from "../providers/completions/pluginsPhp/phpRelationRenderCompletionItemProvider";
import { PhpListRenderCompletionItemProvider } from "../providers/completions/pluginsPhp/phpListRenderCompletionItemProvider";

export function registerCompletionItemProviders(context: vscode.ExtensionContext) {
    themeIni(context);
    themeTwig(context);
    themePhp(context);

    pluginsPhp(context);
    pluginsYaml(context);

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider([phpSelector, octoberTplSelector], new PhpValidationRuleCompletionItemProvider, ...quotes, '|'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider([phpSelector, octoberTplSelector], new MailTemplateCompletionItemProvider, ...quotes));
}

function pluginsYaml(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(yamlSelector, new YamlPermissionsCompletionItemProvider, ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(yamlSelector, new YamlModelClassCompletionItemProvider, ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(yamlSelector, new YamlMigrationNamesCompletionItemProvider, ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(yamlSelector, new YamlPathsCompletionItemProvider, ' ', '/', '~', '$'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(yamlSelector, new YamlOptionsCompletionItemProvider, ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(yamlSelector, new YamlScopesCompletionItemProvider, ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(yamlSelector, new YamlColumnRelationCompletionItemProvider, ' '));
}

function pluginsPhp(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpEnvCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpPermissionCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpConfigCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpComponentPropertyCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpControllerBehaviorConfigPathCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpModelPropertiesAttributesCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpSetContextCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpMakePartialCompletionItemProvider, ...quotes, '/', '~', '$'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpControllerActionUrlCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpPluginIconCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpListRenderCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(phpSelector, new PhpRelationRenderCompletionItemProvider, ...quotes));
}

function themePhp(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new PhpPageCompletionItemProvider, ...quotes));
}

function themeTwig(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigTagCompletionItemProvider, '%', ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigEchoCompletionItemProvider, ' ', '('));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigFilterCompletionItemProvider, '|'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigTestCompletionItemProvider, ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigPageCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigPartialCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigPartialVarsCompletionItemProvider, ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigContentCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigContentVarsCompletionItemProvider, ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigComponentCompletionItemProvider, ...quotes));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigComponentPropertiesCompletionItemProvider, ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigPlaceholdersCompletionItemProvider, ' '));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new TwigAjaxMethodCompletionItemProvider, ...quotes));
}

function themeIni(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new IniPropertyCompletionItemProvider, ...alphabet));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new IniLayoutCompletionItemProvider, '=', "'", '"'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new IniComponentCompletionItemProvider, '['));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(octoberTplSelector, new IniComponentPropertyCompletionItemProvider, ...alphabet));
}
