import * as vscode from 'vscode';
import { chooseProject } from './concerns/choose-project';
import { CommandGeneratorUi } from './generate/command-generator-ui';
import { ComponentGeneratorUi } from './generate/component-generator-ui';
import { ControllerGeneratorUi } from './generate/controller-generator-ui';
import { ExportModelGeneratorUi } from './generate/export-model-generator-ui';
import { FilterWidgetGeneratorUi } from './generate/filter-widget-generator-ui';
import { FormWidgetGeneratorUi } from './generate/form-widget-generator-ui';
import { GenericWidgetGeneratorUi } from './generate/generic-widget-generator-ui';
import { ImportModelGeneratorUi } from './generate/import-model-generator-ui';
import { MailTemplateGeneratorUi } from './generate/mail-template-generator-ui';
import { MigrationGeneratorUi } from './generate/migration-generator-ui';
import { ModelGeneratorUi } from './generate/model-generator-ui';
import { PluginGeneratorUi } from './generate/plugin-generator-ui';
import { ReportWidgetGeneratorUi } from './generate/report-widget-generator-ui';
import { SettingsModelGeneratorUi } from './generate/settings-model-generator-ui';

const GENERATORS: string[] = [
    'Artisan Command',
    'Component',
    'Controller',
    'Export Model',
    'Filter Widget',
    'Form Widget',
    'Import Model',
    'Mail Template',
    'Migration',
    'Model',
    'Plugin',
    'Report Widget',
    'Settings Model',
    'Widget',
];

/**
 * Command for run generators
 */
export async function runGenerator() {
    const project = await chooseProject();
    if (!project) {
        return;
    }

    const generatorName = await vscode.window.showQuickPick(GENERATORS);
    if (!generatorName) {
        return;
    }

    switch (generatorName) {
        case 'Plugin':
            return new PluginGeneratorUi(project).run();
        case 'Controller':
            return new ControllerGeneratorUi(project).run();
        case 'Model':
            return new ModelGeneratorUi(project).run();
        case 'Component':
            return new ComponentGeneratorUi(project).run();
        case 'Settings Model':
            return new SettingsModelGeneratorUi(project).run();
        case 'Import Model':
            return new ImportModelGeneratorUi(project).run();
        case 'Export Model':
            return new ExportModelGeneratorUi(project).run();
        case 'Migration':
            return new MigrationGeneratorUi(project).run();
        case 'Artisan Command':
            return new CommandGeneratorUi(project).run();
        case 'Mail Template':
            return new MailTemplateGeneratorUi(project).run();
        case 'Widget':
            return new GenericWidgetGeneratorUi(project).run();
        case 'Form Widget':
            return new FormWidgetGeneratorUi(project).run();
        case 'Report Widget':
            return new ReportWidgetGeneratorUi(project).run();
        case 'Filter Widget':
            if (!project.platform!.hasFilterWidgets) {
                vscode.window.showErrorMessage('OctoberCMS version of this project does not support filter widgets');
                return;
            }

            return new FilterWidgetGeneratorUi(project).run();
    }
}
