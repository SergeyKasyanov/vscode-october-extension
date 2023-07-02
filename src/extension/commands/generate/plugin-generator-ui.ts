import * as vscode from 'vscode';
import { ocIcons } from '../../../domain/static/oc-icons';
import { Canceled } from '../../services/generators/errors/canceled';
import { PluginGenerator } from '../../services/generators/plugin-generator';
import { GeneratorUiBase, InputValidators } from './generator-ui-base';

export class PluginGeneratorUi extends GeneratorUiBase {

    private options = {
        boot: 'Add boot() method',
        register: 'Add register() method',
        registerComponents: 'Add registerComponents() method',
        registerPageSnippets: 'Add registerPageSnippets() method',
        registerPermissions: 'Add registerPermissions() method',
        registerSettings: 'Add registerSettings() method',
        registerMailTemplates: 'Add registerMailTemplates() method',
        registerMailLayouts: 'Add registerMailLayouts() method',
        registerMailPartials: 'Add registerMailPartials() method',
        registerSchedule: 'Add registerSchedule() method',
        registerMarkupTags: 'Add registerMarkupTags() method',
        registerContentFields: 'Add registerContentFields() method',
        registerNavigation: 'Add registerNavigation() method',
        composer: 'Create composer.json file',
    };

    protected async show() {
        const plugin = await this.ask('Plugin name', InputValidators.plugin);
        const description = await this.ask('Plugin description');
        const icon = await this.chooseFrom(ocIcons, { title: 'Choose icon for plugin' });
        const options = await this.getOptions();

        const generator = new PluginGenerator(this.project, plugin, {
            description: description || 'Description is not provided...',
            icon: icon || 'icon-leaf',
            addBootMethod: options.includes(this.options.boot),
            addRegisterMethod: options.includes(this.options.register),
            addRegisterComponentsMethod: options.includes(this.options.registerComponents),
            addRegisterPageSnippetsMethod: options.includes(this.options.registerPageSnippets),
            addRegisterPermissionsMethod: options.includes(this.options.registerPermissions),
            addRegisterSettingsMethod: options.includes(this.options.registerSettings),
            addRegisterMailTemplatesMethod: options.includes(this.options.registerMailTemplates),
            addRegisterMailLayoutsMethod: options.includes(this.options.registerMailLayouts),
            addRegisterMailPartialsMethod: options.includes(this.options.registerMailPartials),
            addRegisterScheduleMethod: options.includes(this.options.registerSchedule),
            addRegisterMarkupTagsMethod: options.includes(this.options.registerMarkupTags),
            addRegisterContentFieldsMethod: options.includes(this.options.registerContentFields),
            addRegisterNavigationMethod: options.includes(this.options.registerNavigation),
            createComposerJsonFile: options.includes(this.options.composer),
        });

        const generated = generator.generate();

        vscode.window.showInformationMessage('Plugin generated!');

        if (generated) {
            this.showGeneratedFiles(generated);
        }
    }

    private async getOptions() {
        let items = [
            { label: this.options.composer },
            { label: this.options.registerNavigation, picked: true },
            { label: this.options.boot },
            { label: this.options.register },
            { label: this.options.registerComponents },
            { label: this.options.registerPermissions },
            { label: this.options.registerSettings },
            { label: this.options.registerMailTemplates },
            { label: this.options.registerMailLayouts },
            { label: this.options.registerMailPartials },
            { label: this.options.registerSchedule },
            { label: this.options.registerMarkupTags },
        ];


        if (this.project.platform!.hasTailor) {
            items.push({ label: this.options.registerContentFields });
        }

        if (this.project.platform!.hasPageSnippetsSupport) {
            items.push({ label: this.options.registerPageSnippets });
        }

        const options = await vscode.window.showQuickPick(items, { canPickMany: true });

        if (options === undefined) {
            throw new Canceled();
        }

        return options.map(opt => opt.label);
    }

}
