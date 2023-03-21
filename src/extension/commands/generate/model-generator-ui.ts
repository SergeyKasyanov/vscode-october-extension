import * as vscode from 'vscode';
import { Config } from '../../../config';
import { AppDirectory } from '../../../domain/entities/owners/app-directory';
import { Plugin } from '../../../domain/entities/owners/plugin';
import { Str } from '../../../helpers/str';
import { Canceled } from '../../services/generators/errors/canceled';
import { MigrationGenerator } from '../../services/generators/migration-generator';
import { ModelGenerator } from '../../services/generators/model-generator';
import { GeneratorUiBase, InputValidators } from "./generator-ui-base";

export class ModelGeneratorUi extends GeneratorUiBase {

    private options = {
        columnsYaml: 'Add columns.yaml config',
        fieldsYaml: 'Add fields.yaml config',
        timestamps: 'Add timestamps',
        timezones: 'Add timezones to dates',
        casts: 'Add casts',
        relations: 'Add relations',
        nullable: 'Add trait Nullable',
        hashable: 'Add trait Hashable',
        purgeable: 'Add trait Purgeable',
        encryptable: 'Add trait Encryptable',
        sluggable: 'Add trait Sluggable',
        sortable: 'Add trait Sortable',
        sortableRelation: 'Add trait SortableRelation',
        simpleTree: 'Add trait SimpleTree',
        nestedTree: 'Add trait NestedTree',
        validation: 'Add trait Validation',
        softDelete: 'Add trait SoftDelete',
        revisionable: 'Add trait Revisionable',
        multisite: 'Add trait Multisite',
        migration: 'Create migration',
    };

    private plugin?: Plugin | AppDirectory;

    protected async show() {
        const pluginCode = await this.choosePlugin();
        this.plugin = pluginCode === 'app'
            ? this.project.appDir
            : this.project.plugins.find(p => p.name === pluginCode)!;

        if (!this.plugin) {
            vscode.window.showErrorMessage('Plugin does not exists');
            return;
        }

        const model = await this.ask('Model name', InputValidators.className);
        const table = this.plugin instanceof AppDirectory
            ? 'app_' + Str.snakeCase(Str.plural(model))
            : this.plugin.author.toLowerCase() + '_' + Str.snakeCase(this.plugin.nameWithoutAuthor) + '_' + Str.snakeCase(Str.plural(model));
        const options = await this.getOptions();

        const modelGen = new ModelGenerator(this.project, pluginCode, this.getModelGeneratorVars(model, table, options));
        modelGen.checkIfFilesAlreadyExists();

        const generated: string[] = [];

        if (options.includes(this.options.migration)) {
            const migration = 'create_' + Str.snakeCase(Str.plural(model)) + '_table';

            const migrationGen = new MigrationGenerator(this.project, pluginCode, this.getMigrationGeneratorVars(migration, table, options));
            migrationGen.checkIfFilesAlreadyExists();

            const migrationFiles = migrationGen.generate();
            if (migrationFiles) {
                generated.push(...migrationFiles);
            }
        }

        const modelFiles = modelGen.generate();
        if (modelFiles) {
            generated.push(...modelFiles);
        }

        if (generated.length > 0) {
            vscode.window.showInformationMessage('Model generated!');
            this.showGeneratedFiles(generated);
        }
    }

    private async getOptions() {
        let optionValues = [
            { label: this.options.migration, picked: true },
            { label: this.options.columnsYaml, picked: true },
            { label: this.options.fieldsYaml, picked: true },
            { label: this.options.timestamps, picked: true },
            { label: this.options.casts, picked: true },
            { label: this.options.relations, picked: true },
            { label: this.options.validation, picked: true },
            { label: this.options.timezones },
            { label: this.options.nullable },
            { label: this.options.hashable },
            { label: this.options.purgeable },
            { label: this.options.encryptable },
            { label: this.options.sluggable },
            { label: this.options.sortable },
            { label: this.options.simpleTree },
            { label: this.options.nestedTree },
            { label: this.options.softDelete },
            { label: this.options.revisionable },
        ];

        if (this.project.platform!.hasSortableRelationTrait) {
            optionValues.push({ label: this.options.sortableRelation });
        }

        if (this.project.platform!.hasMultisite) {
            optionValues.push({ label: this.options.multisite });
        }

        const options = await vscode.window.showQuickPick(optionValues, { canPickMany: true });

        if (options === undefined) {
            throw new Canceled();
        }

        return options.map(opt => opt.label);
    }

    private getModelGeneratorVars(model: string, table: string, options: string[]) {
        return {
            model,
            table,
            adjacent: Config.isModelsTraitAdjacent,
            addColumnsConfig: options.includes(this.options.columnsYaml),
            addFieldsConfig: options.includes(this.options.fieldsYaml),
            addTimestamps: options.includes(this.options.timestamps),
            addCasts: options.includes(this.options.casts),
            addRelations: options.includes(this.options.relations),
            addTraitNullable: options.includes(this.options.nullable),
            addTraitHashable: options.includes(this.options.hashable),
            addTraitPurgeable: options.includes(this.options.purgeable),
            addTraitEncryptable: options.includes(this.options.encryptable),
            addTraitSluggable: options.includes(this.options.sluggable),
            addTraitSortable: options.includes(this.options.sortable),
            addTraitSortableRelation: options.includes(this.options.sortableRelation),
            addTraitSimpleTree: options.includes(this.options.simpleTree),
            addTraitNestedTree: options.includes(this.options.nestedTree),
            addTraitValidation: options.includes(this.options.validation),
            addTraitSoftDelete: options.includes(this.options.softDelete),
            addTraitRevisionable: options.includes(this.options.revisionable),
            addTraitMultisite: options.includes(this.options.multisite),
            withTimezones: options.includes(this.options.timezones)
        };
    }

    private getMigrationGeneratorVars(migration: string, table: string, options: string[]) {
        return {
            migration,
            table,
            action: 'create',
            addSlug: options.includes(this.options.sluggable),
            addSortOrder: options.includes(this.options.sortable),
            addSimpleTree: options.includes(this.options.simpleTree),
            addNestedTree: options.includes(this.options.nestedTree),
            addSoftDelete: options.includes(this.options.softDelete),
            addTimestamps: options.includes(this.options.timestamps),
            addMultisite: options.includes(this.options.multisite),
            withTimezones: options.includes(this.options.timezones)
        };
    }
}
