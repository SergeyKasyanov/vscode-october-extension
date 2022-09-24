import pluralize = require('pluralize');
import * as vscode from 'vscode';
import { Project } from '../../../services/project';
import { ControllerGenerator } from "../../../services/generators/controllerGenerator";
import { Canceled } from '../../../services/generators/errors/canceled';
import { GeneratorUiBase, InputValidators } from "./generatorUiBase";

export class ControllerGeneratorUi extends GeneratorUiBase {

    private options = {
        listController: 'Add ListController behavior',
        addListFilter: 'Add filters to list',
        addStructure: 'Add "structure" to list config (tree and sorting)',
        formController: 'Add FormController behavior',
        relationController: 'Add RelationController behavior',
        importExportController: 'Add ImportExportController behavior',
    };

    private ways = {
        custom: 'Create regular controller',
        forModel: 'Create controller for model'
    };

    protected async show() {
        const plugin = await this.choosePlugin();
        const way = await this.getWay();

        let model, controller, controllerGuess;
        if (way === this.ways.forModel) {
            model = await this.chooseFrom(
                Project.instance.getModelsNamesByPlugin(plugin),
                { title: 'Choose model' }
            );

            controllerGuess = pluralize.plural(model);
        }

        controller = await this.ask('Controller name', InputValidators.className, controllerGuess);
        model = model || pluralize.singular(controller);

        const options = await this.getOptions();

        const generator = new ControllerGenerator(plugin, {
            controller,
            model,
            addListControllerBehavior: options.includes(this.options.listController),
            addListFilter: options.includes(this.options.addListFilter),
            addStructure: options.includes(this.options.addStructure),
            addFormControllerBehavior: options.includes(this.options.formController),
            addRelationControllerBehavior: options.includes(this.options.relationController),
            addImportExportControllerBehavior: options.includes(this.options.importExportController),
        });

        const generated = generator.generate();

        vscode.window.showInformationMessage('Controller generated!');

        if (generated) {
            this.showGeneratedFiles(generated);
        }
    }

    private async getWay() {
        const way = await vscode.window.showQuickPick([
            { label: this.ways.custom, detail: 'Model name will be guessed from controller name'},
            { label: this.ways.forModel, detail: 'Choose model for controller'},
        ], {
            title: 'How to generate controller?'
        });

        if (way === undefined) {
            throw new Canceled();
        }

        return way.label;
    }

    private async getOptions() {
        const options = await vscode.window.showQuickPick([
            { label: this.options.listController, picked: true },
            { label: this.options.formController, picked: true },
            { label: this.options.addStructure },
            { label: this.options.addListFilter },
            { label: this.options.relationController },
            { label: this.options.importExportController },
        ], { canPickMany: true });

        if (options === undefined) {
            throw new Canceled();
        }

        return options.map(opt => opt.label);
    }

}
