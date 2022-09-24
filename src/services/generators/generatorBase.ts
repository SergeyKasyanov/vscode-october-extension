import * as fs from "fs";
import { twig } from "twig";
import * as vscode from "vscode";
import { pluginsPath } from "../../helpers/paths";
import * as str from "../../helpers/str";
import { writeFile } from "../../helpers/writeFile";
import { SomeFilesAlreadyExists } from "./errors/someFilesAlreadyExists";

export interface Stubs {
    [name: string]: {
        destination: string,
        template: (variables?: object) => string,
    }
}

export interface Paths {
    [key: string]: string
}

export interface TemplateVars {
    [key: string]: string | boolean
}

export abstract class GeneratorBase {

    protected stubs: Stubs = {};

    protected destinations: Paths = {};

    protected templateVars: TemplateVars = {};

    protected pluginPath: string = '';

    constructor(protected pluginName: string, vars: TemplateVars = {}) {
        this.buildPluginPath();
        this.setVars(vars);
    }

    protected buildPluginPath() {
        let author, plugin;
        [author, plugin] = this.pluginName.split('.');

        this.pluginPath = pluginsPath(author.toLowerCase() + '/' + plugin.toLowerCase());
    }

    protected setVars(vars: TemplateVars = {}) {
        this.templateVars = {};

        [vars['author'], vars['plugin']] = this.pluginName.split('.');

        for (const key in vars) {
            if (Object.prototype.hasOwnProperty.call(vars, key)) {
                const value = vars[key];

                this.templateVars[key] = value;

                if (typeof (value) === 'string') {
                    this.templateVars[key + '_camel'] = str.camelCase(value);
                    this.templateVars[key + '_pascal'] = str.pascalCase(value);
                    this.templateVars[key + '_dashed'] = str.dashedCase(value);
                    this.templateVars[key + '_snake'] = str.snakeCase(value);
                    this.templateVars[key + '_lower'] = value.toLowerCase();
                }
            }
        }
    }

    protected buildDestinationsPaths() {
        for (const stubName in this.stubs) {
            if (Object.prototype.hasOwnProperty.call(this.stubs, stubName)) {
                const destinationPathTemplate = this.stubs[stubName].destination;

                this.destinations[stubName] = this.pluginPath + '/' + this.parseTwig(destinationPathTemplate, this.templateVars);
            }
        }
    }

    protected parseTwig(template: string, data: Object): string {
        return twig({ data: template }).render(data);
    }

    public generate() {
        try {
            this.checkIfFilesAlreadyExists();
            return this.buildStubs();
        } catch (SomeFilesAlreadyExists) {
            vscode.window.showErrorMessage("Some files already exists");
        }
    }

    public checkIfFilesAlreadyExists() {
        if (Object.keys(this.destinations).length === 0) {
            this.buildDestinationsPaths();
        }

        for (const stubName in this.stubs) {
            if (Object.prototype.hasOwnProperty.call(this.stubs, stubName)) {
                if (fs.existsSync(this.destinations[stubName])) {
                    throw new SomeFilesAlreadyExists();
                }
            }
        }
    }

    protected buildStubs() {
        let builtFiles: string[] = [];

        for (const stubName in this.stubs) {
            if (Object.prototype.hasOwnProperty.call(this.stubs, stubName)) {
                const stub = this.stubs[stubName];

                if (this.needToMakeStub(stubName)) {
                    const content = stub.template(this.templateVars);

                    writeFile(this.destinations[stubName], content);

                    builtFiles.push(this.destinations[stubName]);
                }
            }
        }

        return builtFiles.sort();
    }

    protected needToMakeStub(stub: string): boolean {
        return true;
    }

}
