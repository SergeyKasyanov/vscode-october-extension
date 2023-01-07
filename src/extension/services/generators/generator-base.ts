import { twig } from "twig";
import * as vscode from "vscode";
import { AppDirectory } from "../../../domain/entities/owners/app-directory";
import { Plugin } from "../../../domain/entities/owners/plugin";
import { Project } from "../../../domain/entities/project";
import { FsHelpers } from "../../../domain/helpers/fs-helpers";
import { PathHelpers } from "../../../domain/helpers/path-helpers";
import { Str } from "../../../helpers/str";
import { SomeFilesAlreadyExists } from "./errors/some-files-already-exists";
import path = require("path");

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

    protected plugin?: Plugin | AppDirectory;

    constructor(
        protected project: Project,
        protected pluginName: string,
        vars: TemplateVars = {}
    ) {
        if (pluginName === 'app' && project.platform?.hasAppDirectory && project.appDir) {
            this.plugin = project.appDir;
        } else {
            this.plugin = project.plugins.find(p => p.name === pluginName);
        }

        let author, code;
        [author, code] = pluginName.split('.');
        this.pluginPath = this.plugin?.path || PathHelpers.pluginsPath(
            project.path,
            path.join(author.toLowerCase(), code.toLowerCase())
        );

        this.setVars(vars);
    }

    protected setVars(vars: TemplateVars = {}) {
        this.templateVars = {};

        if (this.plugin instanceof Plugin) {
            vars['author'] = this.plugin.author;
            vars['plugin'] = this.plugin.nameWithoutAuthor;
        } else if (this.plugin instanceof AppDirectory) {
            vars['author'] = '';
            vars['plugin'] = this.plugin.name;
        } else {
            [vars['author'], vars['plugin']] = this.pluginName.split('.');
        }

        for (const key in vars) {
            if (Object.prototype.hasOwnProperty.call(vars, key)) {
                const value = vars[key];

                this.templateVars[key] = value;

                if (typeof (value) === 'string' && !value.startsWith('namespace')) {
                    this.templateVars[key + '_camel'] = Str.camelCase(value);
                    this.templateVars[key + '_pascal'] = Str.pascalCase(value);
                    this.templateVars[key + '_dashed'] = Str.dashedCase(value);
                    this.templateVars[key + '_snake'] = Str.snakeCase(value);
                    this.templateVars[key + '_lower'] = value.toLowerCase();
                }
            }
        }

        if (this.plugin instanceof Plugin) {
            this.templateVars['namespace'] = Str.pascalCase(this.plugin.author) + '\\' + Str.pascalCase(this.plugin.nameWithoutAuthor);
            this.templateVars['namespace_snake'] = this.plugin.author.toLowerCase() + '_' + this.plugin.nameWithoutAuthor.toLowerCase();
            this.templateVars['namespace_slash'] = this.plugin.author.toLowerCase() + '/' + this.plugin.nameWithoutAuthor.toLowerCase();
            this.templateVars['namespace_dot'] = this.plugin.author.toLowerCase() + '.' + this.plugin.nameWithoutAuthor.toLowerCase();
            this.templateVars['namespace_dot_capital'] = Str.pascalCase(this.plugin.author) + '.' + Str.pascalCase(this.plugin.nameWithoutAuthor);
        } else if (this.plugin instanceof AppDirectory) {
            this.templateVars['namespace'] = 'App';
            this.templateVars['namespace_snake'] = 'app';
            this.templateVars['namespace_slash'] = 'app';
            this.templateVars['namespace_dot'] = 'app';
            this.templateVars['namespace_dot_capital'] = 'App';
        } else {
            this.templateVars['namespace'] = Str.pascalCase(vars['author']) + '\\' + Str.pascalCase(vars['plugin']);
            this.templateVars['namespace_snake'] = vars['author'].toLowerCase() + '_' + vars['plugin'].toLowerCase();
            this.templateVars['namespace_slash'] = vars['author'].toLowerCase() + '/' + vars['plugin'].toLowerCase();
            this.templateVars['namespace_dot'] = vars['author'].toLowerCase() + '.' + vars['plugin'].toLowerCase();
            this.templateVars['namespace_dot_capital'] = Str.pascalCase(vars['author']) + '.' + Str.pascalCase(vars['plugin']);
        }

        const date = new Date();

        this.templateVars['now'] = date.getFullYear() + '_'
            + (date.getMonth() + 1).toString().padStart(2, '0') + '_'
            + date.getDate().toString() + '_'
            + date.getHours().toString().padStart(2, '0')
            + date.getMinutes().toString().padStart(2, '0')
            + date.getSeconds().toString().padStart(2, '0');
    }

    public generate() {
        try {
            this.checkIfFilesAlreadyExists();
            const stubs = this.buildStubs();

            return stubs;
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
                if (FsHelpers.exists(this.destinations[stubName])) {
                    throw new SomeFilesAlreadyExists();
                }
            }
        }
    }

    protected buildDestinationsPaths() {
        for (const stubName in this.stubs) {
            if (Object.prototype.hasOwnProperty.call(this.stubs, stubName)) {
                const destinationPathTemplate = this.stubs[stubName].destination;

                this.destinations[stubName] = (this.pluginPath + '/' + this.parseTwig(destinationPathTemplate, this.templateVars)).split('/').join(path.sep);
            }
        }
    }

    protected parseTwig(template: string, data: Object): string {
        return twig({ data: template }).render(data);
    }

    protected buildStubs() {
        const builtFiles: string[] = [];

        for (const stubName in this.stubs) {
            if (Object.prototype.hasOwnProperty.call(this.stubs, stubName)) {
                const stub = this.stubs[stubName];

                if (this.needToMakeStub(stubName)) {
                    const content = stub.template(this.templateVars);

                    FsHelpers.writeFile(this.destinations[stubName], content);

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
