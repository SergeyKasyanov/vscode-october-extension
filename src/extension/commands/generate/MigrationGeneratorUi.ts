import { existsSync } from 'fs';
import * as vscode from 'vscode';
import { Project } from '../../../services/project';
import { Plugin } from '../../../types/plugin/plugin';
import { pluginsPath } from '../../../helpers/paths';
import { snakeCase } from '../../../helpers/str';
import { Canceled } from '../../../services/generators/errors/canceled';
import { MigrationGenerator } from '../../../services/generators/migrationGenerator';
import { GeneratorUiBase, InputValidators } from "./generatorUiBase";

import pluralize = require('pluralize');

export class MigrationGeneratorUi extends GeneratorUiBase {

    private pluginCode: string = '';
    private author: string = '';
    private pluginName: string = '';

    private ways = {
        newTable: 'New table',
        changeTable: 'Change table',
        newForModel: 'New table for model',
        changeForModel: 'Change table for model',
    };

    private options = {
        addSlug: 'Add slug',
        addSortOrder: 'Add sort order',
        addSimpleTree: 'Add simple tree',
        addNestedTree: 'Add nested tree',
        addSoftDelete: 'Add soft delete',
    };

    protected async show() {
        this.pluginCode = await this.choosePlugin();
        [this.author, this.pluginName] = Plugin.splitCode(this.pluginCode);

        const way = await this.getWay();
        const { migrationGuess, tableGuess, action } = await this.guess(way.label);
        const migration = await this.ask('Migration file name', this.getMigrationValidator(), migrationGuess);
        const table = await this.ask('Table name', InputValidators.migration, tableGuess);

        const { addSlug, addSortOrder, addSimpleTree, addNestedTree, addSoftDelete } = await this.getOptions(action);

        const generator = new MigrationGenerator(this.pluginCode, {
            migration,
            table,
            action: action === TableAction.create ? 'create' : 'change',
            addSlug,
            addSortOrder,
            addSimpleTree,
            addNestedTree,
            addSoftDelete,
        });

        const generated = generator.generate();

        vscode.window.showInformationMessage('Migration generated!');

        if (generated) {
            this.showGeneratedFiles(generated);
        }
    }

    private async getWay() {
        const way = await vscode.window.showQuickPick([
            { label: this.ways.newTable, detail: 'Generates migration for creating new table' },
            { label: this.ways.changeTable, detail: 'Generates migration for changing existing table' },
            { label: this.ways.newForModel, detail: 'Generates migration for creating table for existing model' },
            { label: this.ways.changeForModel, detail: 'Generates migration for changing existing model\'s table' },
        ], {
            title: 'Choose migration type'
        });

        if (way === undefined) {
            throw new Canceled();
        }

        return way;
    }

    private async guess(way: string) {
        let migrationGuess, tableGuess, action;

        if ([this.ways.newTable, this.ways.changeTable].includes(way)) {

            action = (way === this.ways.newTable) ? TableAction.create : TableAction.change;
            migrationGuess = action === TableAction.create ? 'create_' : 'change_';
            tableGuess = tableGuess = [
                this.author.toLowerCase(),
                snakeCase(this.pluginName)
            ].join('_') + '_';

        } else if ([this.ways.newForModel, this.ways.changeForModel].includes(way)) {

            const model = await this.chooseFrom(
                Project.instance.getModelsNamesByPlugin(this.pluginCode),
                { title: 'Choose model' }
            );

            action = (way === this.ways.newForModel) ? TableAction.create : TableAction.change;
            migrationGuess = (action === TableAction.create ? 'create_' : 'change_') + snakeCase(pluralize.plural(model)) + '_table';
            tableGuess = [
                this.author.toLowerCase(),
                snakeCase(this.pluginName),
                snakeCase(pluralize.plural(model))
            ].join('_');

        } else {
            throw new Canceled();
        }

        return { migrationGuess, tableGuess, action };
    }

    private getMigrationValidator() {
        return (fileName: string) => {
            let path = pluginsPath([this.author, this.pluginName, 'updates', fileName + '.php'].join('/'));

            if (existsSync(path)) {
                return 'Migration file with this name already exists!';
            }
        };
    }

    private async getOptions(action: TableAction) {
        let addSlug = false,
            addSortOrder = false,
            addSimpleTree = false,
            addNestedTree = false,
            addSoftDelete = false;

        if (action === TableAction.create) {
            const options = await vscode.window.showQuickPick([
                { label: this.options.addSlug, description: 'Add "slug" column' },
                { label: this.options.addSortOrder, description: 'Add "sort_order" column for Sortable model trait' },
                { label: this.options.addSimpleTree, description: 'Add "parent_id" column for SimpleTree model trait' },
                { label: this.options.addNestedTree, description: 'Add columns for NestedTree model trait' },
                { label: this.options.addSoftDelete, description: 'Add "deleted_at" column for SoftDelete trait' },
            ], { canPickMany: true });

            if (options === undefined) {
                throw new Canceled();
            }

            const picked = options.map(opt => opt.label);

            addSlug = picked.includes(this.options.addSlug);
            addSortOrder = picked.includes(this.options.addSortOrder);
            addSimpleTree = picked.includes(this.options.addSimpleTree);
            addNestedTree = picked.includes(this.options.addNestedTree);
            addSoftDelete = picked.includes(this.options.addSoftDelete);
        }

        return { addSlug, addSortOrder, addSimpleTree, addNestedTree, addSoftDelete };
    }
}

enum TableAction {
    create,
    change
}
