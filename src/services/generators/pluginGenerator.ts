import { GeneratorBase, Stubs, TemplateVars } from "./generatorBase";

export class PluginGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        pluginClass: {
            destination: 'Plugin.php',
            template: require("./templates/plugin/plugin.twig")
        },
        composerJson: {
            destination: 'composer.json',
            template: require("./templates/plugin/composer.json.twig"),
        },
        versionYaml: {
            destination: 'updates/version.yaml',
            template: require("./templates/plugin/version.yaml.twig")
        }
    };

    protected setVars(vars: TemplateVars): void {
        super.setVars({
            description: vars.description,
            icon: vars.icon,
            addBootMethod: !!vars.addBootMethod,
            addRegisterMethod: !!vars.addRegisterMethod,
            addRegisterComponentsMethod: !!vars.addRegisterComponentsMethod,
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
