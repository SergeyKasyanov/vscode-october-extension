import * as vscode from 'vscode';
import { Platform } from '../../services/platform';
import { CommandGeneratorUi } from './generate/commandGeneratorUi';
import { ComponentGeneratorUi } from './generate/componentGeneratorUi';
import { ControllerGeneratorUi } from './generate/controllerGeneratorUi';
import { ExportModelGeneratorUi } from './generate/exportModelGeneratorUi';
import { FilterWidgetGeneratorUi } from './generate/filterWidgetGeneratorUi';
import { FormWidgetGeneratorUi } from './generate/formWidgetGeneratorUi';
import { GenericWidgetGeneratorUi } from './generate/genericWidgetGeneratorUi';
import { ImportModelGeneratorUi } from './generate/importModelGeneratorUi';
import { MailTemplateGeneratorUi } from './generate/mailTemplateGeneratorUi';
import { MigrationGeneratorUi } from './generate/migrationGeneratorUi';
import { ModelGeneratorUi } from './generate/modelGeneratorUi';
import { PluginGeneratorUi } from './generate/pluginGeneratorUi';
import { ReportWidgetGeneratorUi } from './generate/reportWidgetGeneratorUi';
import { SettingsModelGeneratorUi } from './generate/settingsModelGeneratorUi';

export class Generate {
    private generators: string[] = [
        'Plugin',
        'Model',
        'Controller',
        'Component',
        'Settings Model',
        'Import Model',
        'Export Model',
        'Migration',
        'Artisan Command',
        'Mail Template',
        'Widget',
        'Form Widget',
        'Report Widget',
    ];

    constructor() {
        if (Platform.getInstance().hasFilterWidgets()) {
            this.generators.push('Filter Widget');
        }
    }

    public async chooseGenerator() {
        const generatorName = await vscode.window.showQuickPick(this.generators);

        if (!generatorName) {
            return;
        }

        switch (generatorName) {
            case 'Plugin':
                (new PluginGeneratorUi).run();
                break;

            case 'Controller':
                (new ControllerGeneratorUi).run();
                break;

            case 'Model':
                (new ModelGeneratorUi).run();
                break;

            case 'Component':
                (new ComponentGeneratorUi).run();
                break;

            case 'Settings Model':
                (new SettingsModelGeneratorUi).run();
                break;

            case 'Import Model':
                (new ImportModelGeneratorUi).run();
                break;

            case 'Export Model':
                (new ExportModelGeneratorUi).run();
                break;

            case 'Migration':
                (new MigrationGeneratorUi).run();
                break;

            case 'Artisan Command':
                (new CommandGeneratorUi).run();
                break;

            case 'Mail Template':
                (new MailTemplateGeneratorUi).run();
                break;

            case 'Widget':
                (new GenericWidgetGeneratorUi).run();
                break;

            case 'Form Widget':
                (new FormWidgetGeneratorUi).run();
                break;

            case 'Report Widget':
                (new ReportWidgetGeneratorUi).run();
                break;

            case 'Filter Widget':
                (new FilterWidgetGeneratorUi).run();
                break;

            default:
                break;
        }
    }
}
