import * as vscode from 'vscode';
import { Project } from '../../../services/project';
import { rootPath } from '../../../helpers/paths';
import { Canceled } from '../../../services/generators/errors/canceled';

export abstract class GeneratorUiBase {

    public async run() {
        try {
            await this.show();
        } catch (err) {
            if (err instanceof Canceled) {
                vscode.window.showInformationMessage('Generator canceled.');
                return;
            }

            throw err;
        }
    }

    protected async show() { }

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

    protected getValidatorCallback(validator: InputValidators | ((value: string) => string | undefined) | null = null) {
        let validatorCallback: (value: string) => string | undefined = () => undefined;

        if (typeof validator === 'function') {
            validatorCallback = validator;
        } else {

            switch (validator) {
                case InputValidators.plugin:
                    validatorCallback = function (value: string) {
                        const nameIsValid = /^[a-zA-Z]+\w*\.[a-zA-Z]+\w*/.test(value);

                        if (!nameIsValid) {
                            return 'Plugin name must be like "Vendor.Plugin"';
                        }

                        if (Project.instance.isPluginExists(value)) {
                            return `Plugin "${value}" already exists!`;
                        }
                    };
                    break;

                case InputValidators.className:
                    validatorCallback = function (value: string) {
                        const nameIsValid = /^[a-zA-Z]+\w*/.test(value);

                        if (!nameIsValid) {
                            return 'Incorrect value';
                        }
                    };
                    break;

                case InputValidators.migration:
                    validatorCallback = function (value: string) {
                        const nameIsValid = /^[a-zA-Z]+\w*/.test(value);

                        if (!nameIsValid) {
                            return 'Incorrect value';
                        }
                    };
                    break;
            }
        }

        return validatorCallback;
    }

    protected async choosePlugin() {
        const plugins = Project.instance.getPlugins();
        const plugin = await vscode.window.showQuickPick(Object.keys(plugins), { title: 'Choose plugin' });

        if (plugin === undefined) {
            throw new Canceled();
        }

        return plugin.toString();
    }

    protected cancel() {
        throw new Canceled();
    }

    protected async showGeneratedFiles(generatedFiles: string[]) {
        let shorts: { [short: string]: string } = {};

        for (const file of generatedFiles) {
            shorts[file.replace(rootPath(), '')] = file;
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
