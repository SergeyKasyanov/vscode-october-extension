import * as vscode from 'vscode';
import { Plugin } from '../../../domain/entities/owners/plugin';
import { FsHelpers } from '../../../domain/helpers/fs-helpers';
import { Str } from '../../../helpers/str';
import { Canceled } from '../../services/generators/errors/canceled';
import { MigrationGenerator } from '../../services/generators/migration-generator';
import { GeneratorUiBase, InputValidators } from "./generator-ui-base";
import path = require('path');
import { AppDirectory } from '../../../domain/entities/owners/app-directory';


export class MigrationGeneratorUi extends GeneratorUiBase {

    private author: string = '';
    private pluginName: string = '';
    private plugin?: Plugin | AppDirectory;

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
        addMultisite: 'Add multisite columns',
    };

    protected async show() {
        const pluginCode = await this.choosePlugin();
        this.plugin = pluginCode === 'app'
            ? this.project.appDir
            : this.project.plugins.find(p => p.name === pluginCode)!;

        if (!this.plugin) {
            vscode.window.showErrorMessage('Plugin does not exists');
            return;
        }

        if (this.plugin instanceof AppDirectory) {
            this.pluginName = 'app';
        } else {
            this.author = this.plugin.author;
            this.pluginName = this.plugin.nameWithoutAuthor;
        }

        const way = await this.getWay();
        const { migrationGuess, tableGuess, action } = await this.guess(way.label);
        const migration = await this.ask('Migration file name', this.getMigrationValidator(), migrationGuess);
        const table = await this.ask('Table name', InputValidators.migration, tableGuess);

        const { addSlug, addSortOrder, addSimpleTree, addNestedTree, addSoftDelete, addMultisite } = await this.getOptions(action);

        const generator = new MigrationGenerator(this.project, pluginCode, {
            migration,
            table,
            action: action === TableAction.create ? 'create' : 'change',
            addSlug,
            addSortOrder,
            addSimpleTree,
            addNestedTree,
            addSoftDelete,
            addMultisite
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

            if (this.plugin instanceof AppDirectory) {
                tableGuess = 'app_';
            } else {
                tableGuess = [
                    this.author.toLowerCase(),
                    Str.snakeCase(this.pluginName)
                ].join('_') + '_';
            }

        } else if ([this.ways.newForModel, this.ways.changeForModel].includes(way)) {

            const model = await this.chooseFrom(
                this.plugin!.models.map(m => m.uqn),
                { title: 'Choose model' }
            );

            action = (way === this.ways.newForModel) ? TableAction.create : TableAction.change;
            migrationGuess = (action === TableAction.create ? 'create_' : 'change_') + Str.snakeCase(Str.plural(model)) + '_table';

            if (this.plugin instanceof AppDirectory) {
                tableGuess = 'app_' + Str.snakeCase(Str.plural(model));
            } else {
                tableGuess = [
                    this.author.toLowerCase(),
                    Str.snakeCase(this.pluginName),
                    Str.snakeCase(Str.plural(model))
                ].join('_');;
            }

        } else {
            throw new Canceled();
        }

        return { migrationGuess, tableGuess, action };
    }

    private getMigrationValidator() {
        return (fileName: string) => {
            const migrationPath = this.plugin instanceof AppDirectory
                ? path.join(this.plugin.path, 'database', 'migrations', fileName + 'php')
                : path.join(this.plugin!.path, 'updates', fileName + '.php');

            if (FsHelpers.exists(migrationPath)) {
                return 'Migration file with this name already exists!';
            }
        };
    }

    private async getOptions(action: TableAction) {
        let addSlug = false,
            addSortOrder = false,
            addSimpleTree = false,
            addNestedTree = false,
            addSoftDelete = false,
            addMultisite = false;

        if (action === TableAction.create) {
            const labels = [
                { label: this.options.addSlug, description: 'Add "slug" column' },
                { label: this.options.addSortOrder, description: 'Add "sort_order" column for Sortable model trait' },
                { label: this.options.addSimpleTree, description: 'Add "parent_id" column for SimpleTree model trait' },
                { label: this.options.addNestedTree, description: 'Add columns for NestedTree model trait' },
                { label: this.options.addSoftDelete, description: 'Add "deleted_at" column for SoftDelete trait' },
            ];

            if (this.project.platform!.hasMultisite) {
                labels.push({ label: this.options.addMultisite, description: 'Add columns for Multisite trait' },);
            }

            const options = await vscode.window.showQuickPick(labels, { canPickMany: true });

            if (options === undefined) {
                throw new Canceled();
            }

            const picked = options.map(opt => opt.label);

            addSlug = picked.includes(this.options.addSlug);
            addSortOrder = picked.includes(this.options.addSortOrder);
            addSimpleTree = picked.includes(this.options.addSimpleTree);
            addNestedTree = picked.includes(this.options.addNestedTree);
            addSoftDelete = picked.includes(this.options.addSoftDelete);
            addMultisite = picked.includes(this.options.addMultisite);
        }

        return { addSlug, addSortOrder, addSimpleTree, addNestedTree, addSoftDelete, addMultisite };
    }
}

enum TableAction {
    create,
    change
}
