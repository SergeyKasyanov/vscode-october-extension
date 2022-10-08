import * as vscode from 'vscode';
import { adjacentModelTraits } from '../../../config';
import { Platform } from '../../../services/platform';
import { Plugin } from '../../../types/plugin/plugin';
import { snakeCase } from '../../../helpers/str';
import { Canceled } from '../../../services/generators/errors/canceled';
import { MigrationGenerator } from '../../../services/generators/migrationGenerator';
import { ModelGenerator } from '../../../services/generators/modelGenerator';
import { GeneratorUiBase, InputValidators } from "./generatorUiBase";

import pluralize = require('pluralize');

export class ModelGeneratorUi extends GeneratorUiBase {

    private options = {
        columnsYaml: 'Add columns.yaml config',
        fieldsYaml: 'Add fields.yaml config',
        timestamps: 'Add timestamps',
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

    protected async show() {
        const plugin = await this.choosePlugin();

        let author: string, pluginName: string;
        [author, pluginName] = Plugin.splitCode(plugin);

        const model = await this.ask('Model name', InputValidators.className);
        const table = author.toLowerCase() + '_' + snakeCase(pluginName) + '_' + snakeCase(pluralize.plural(model));
        const options = await this.getOptions();

        const modelGen = new ModelGenerator(plugin, this.getModelGeneratorVars(model, table, options));
        modelGen.checkIfFilesAlreadyExists();

        let generated: string[] = [];

        if (options.includes(this.options.migration)) {
            const migration = 'create_' + snakeCase(pluralize.plural(model)) + '_table';
            const table = author.toLowerCase() + '_' + snakeCase(pluginName) + '_' + snakeCase(pluralize.plural(model));

            const migrationGen = new MigrationGenerator(plugin, this.getMigrationGeneratorVars(migration, table, options));
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

        vscode.window.showInformationMessage('Model generated!');

        if (generated.length > 0) {
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

        if (Platform.getInstance().hasSortableRelationTrait()) {
            optionValues.push({ label: this.options.sortableRelation });
        }

        if (Platform.getInstance().hasMultisite()) {
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
            adjacent: adjacentModelTraits(),
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
        };
    }
}
