import * as vscode from 'vscode';
import { Project } from '../../../domain/entities/project';
import { PathHelpers } from '../../../domain/helpers/path-helpers';
import { Canceled } from '../../services/generators/errors/canceled';

/**
 * Base class for generators ui
 */
export abstract class GeneratorUiBase {

    constructor(protected project: Project) { }

    /**
     * Run generator ui
     */
    async run() {
        try {
            await this.show();
        } catch (err) {
            if (err instanceof Canceled) {
                return;
            }

            throw err;
        }
    }

    protected async show() { }

    /**
     * Ask user something.
     * Wrapper for showInputBox()
     *
     * @param title
     * @param validator
     * @param defaultValue
     * @returns
     */
    protected async ask(
        title: string,
        validator: InputValidators | ((value: string) => string | undefined) | null = null,
        defaultValue: string | undefined = undefined
    ) {
        const value = await vscode.window.showInputBox({
            title: title,
            value: defaultValue,
            validateInput: this.getValidatorCallback(validator)
        });

        if (value === undefined) {
            throw new Canceled();
        }

        return value;
    }

    protected async chooseFrom(variants: string[], options?: vscode.QuickPickOptions) {
        const val = await vscode.window.showQuickPick(variants, options);
        if (val === undefined) {
            throw new Canceled();
        }

        return val;
    }

    /**
     * Get validator callback for input box
     *
     * @param validator
     * @returns
     */
    protected getValidatorCallback(
        validator: InputValidators | ((value: string) => string | undefined) | null
    ) {
        if (typeof validator === 'function') {
            return validator;
        } else {
            const project = this.project;

            switch (validator) {
                case InputValidators.plugin:
                    return function (value: string) {
                        const nameIsValid = /^[a-zA-Z]+\w*\.[a-zA-Z]+\w*/.test(value);
                        if (!nameIsValid) {
                            return 'Plugin name must be like "Vendor.Plugin"';
                        }

                        if (project.findOwnerByName(value)) {
                            return `Plugin "${value}" already exists!`;
                        }
                    };

                case InputValidators.className:
                    return function (value: string) {
                        const nameIsValid = /^[a-zA-Z]+\w*/.test(value);
                        if (!nameIsValid) {
                            return 'Incorrect value';
                        }
                    };

                case InputValidators.migration:
                    return function (value: string) {
                        const nameIsValid = /^[a-zA-Z]+\w*/.test(value);
                        if (!nameIsValid) {
                            return 'Incorrect value';
                        }
                    };
            }
        }
    }

    /**
     * Choose plugin
     *
     * @returns
     */
    protected async choosePlugin() {
        let pluginsNames = this.project.plugins.map(p => p.name);
        if (this.project.platform!.hasAppDirectory && this.project.appDir) {
            pluginsNames.push('app');
        }

        const plugin = await vscode.window.showQuickPick(pluginsNames.sort(), { title: 'Choose plugin' });

        if (plugin === undefined) {
            throw new Canceled();
        }

        return plugin;
    }

    /**
     * Choose from list of generated files to open
     *
     * @param generatedFiles
     * @returns
     */
    protected async showGeneratedFiles(generatedFiles: string[]) {
        const rootPath = PathHelpers.rootPath(this.project.path);
        const shorts: { [short: string]: string } = {};

        for (const file of generatedFiles) {
            shorts[file.replace(rootPath, '')] = file;
        }

        const filesToOpen = await vscode.window.showQuickPick(Object.keys(shorts), { canPickMany: true, title: 'Choose files to open' });

        if (filesToOpen === undefined) {
            return;
        }

        for (const short of filesToOpen) {
            vscode.window.showTextDocument(vscode.Uri.file(shorts[short]));
        }
    }
}

export enum InputValidators {
    plugin,
    className,
    migration
}
