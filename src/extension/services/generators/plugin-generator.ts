import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import pluginTwig from "./templates/plugin/plugin.twig";
import composerJsonTwig from "./templates/plugin/composer.json.twig";
import versionYamlTwig from "./templates/plugin/version.yaml.twig";

export class PluginGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        pluginClass: {
            destination: 'Plugin.php',
            template: pluginTwig
        },
        composerJson: {
            destination: 'composer.json',
            template: composerJsonTwig,
        },
        versionYaml: {
            destination: 'updates/version.yaml',
            template: versionYamlTwig
        }
    };

    protected setVars(vars: TemplateVars): void {
        super.setVars({
            description: vars.description,
            icon: vars.icon,
            addBootMethod: !!vars.addBootMethod,
            addRegisterMethod: !!vars.addRegisterMethod,
            addRegisterComponentsMethod: !!vars.addRegisterComponentsMethod,
            addRegisterPageSnippetsMethod: !!vars.addRegisterPageSnippetsMethod,
            addRegisterPermissionsMethod: !!vars.addRegisterPermissionsMethod,
            addRegisterSettingsMethod: !!vars.addRegisterSettingsMethod,
            addRegisterMailTemplatesMethod: !!vars.addRegisterMailTemplatesMethod,
            addRegisterMailLayoutsMethod: !!vars.addRegisterMailLayoutsMethod,
            addRegisterMailPartialsMethod: !!vars.addRegisterMailPartialsMethod,
            addRegisterScheduleMethod: !!vars.addRegisterScheduleMethod,
            addRegisterMarkupTagsMethod: !!vars.addRegisterMarkupTagsMethod,
            addRegisterContentFieldsMethod: !!vars.addRegisterContentFieldsMethod,
            addRegisterNavigationMethod: !!vars.addRegisterNavigationMethod,
            createComposerJsonFile: !!vars.createComposerJsonFile,
        });
    }

    protected needToMakeStub(stub: string): boolean {
        if (stub === 'composerJson') {
            return !!this.templateVars.createComposerJsonFile;
        }

        return true;
    }

}
