import * as fs from 'fs';
import path = require('path');
import { Engine, Namespace } from 'php-parser';
import * as vscode from 'vscode';
import { pluginsPath, rootPath } from "../../helpers/paths";
import { execPhp } from "../../helpers/shell";
import { Plugin } from "../../types/plugin/plugin";
import { PhpDataLoader } from './base/phpDataLoader';
import phpCode from './php/pluginsLoaderCode';

export class PluginsDataLoader extends PhpDataLoader {
    private static instance: PluginsDataLoader;

    public static getInstance(): PluginsDataLoader {
        if (!this.instance) {
            this.instance = new PluginsDataLoader();
        }

        return this.instance;
    }

    protected getPhpScript(): string {
        return phpCode;
    }

    protected processData(data: any): void {
        let plugins: { [code: string]: Plugin } = {};

        for (const code in data) {
            plugins[code] = new Plugin(code, data[code]['menu']);
        }

        this._data = plugins;
    }

    protected getWatcherPathPattern(): vscode.GlobPattern {
        return new vscode.RelativePattern(pluginsPath(), "**" + path.sep + "Plugin.php");
    }

    protected async loadData(): Promise<void> {
        console.debug(this.constructor.name + ' loading...');

        try {
            let phpCode = `require '${rootPath("bootstrap/autoload.php")}';
                (require_once '${rootPath("bootstrap/app.php")}')
                    ->make(\\Illuminate\\Contracts\\Console\\Kernel::class)
                    ->bootstrap();
            `;

            phpCode += ' ' + this.getPhpScript();

            const rawData = await execPhp(phpCode);
            const data = JSON.parse(rawData);

            this.processData(data);
        } catch (err) {
            this.loadDataByFiles();
        }
    }

    private async loadDataByFiles() {
        const base = pluginsPath();

        const authors = fs.readdirSync(base, { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(dir => dir.name);

        let plugins: { [code: string]: Plugin } = {};

        for (const a in authors) {
            if (Object.prototype.hasOwnProperty.call(authors, a)) {
                const author = authors[a];
                const pluginsDirs = fs.readdirSync(base + '/' + author, { withFileTypes: true })
                    .filter(entry => entry.isDirectory())
                    .map(dir => dir.name);

                for (const p in pluginsDirs) {
                    if (Object.prototype.hasOwnProperty.call(pluginsDirs, p)) {
                        const pluginClassPath = pluginsPath(author + '/' + pluginsDirs[p] + '/Plugin.php');

                        if (!fs.existsSync(pluginClassPath)) {
                            continue;
                        }

                        const engine = new Engine({});
                        const ast = engine.parseCode(fs.readFileSync(pluginClassPath).toString(), pluginClassPath);
                        const ns = ast.children.find(el => el.kind === 'namespace') as Namespace;
                        const pluginCode = ns.name.replace('\\', '.');

                        plugins[pluginCode] = new Plugin(pluginCode);
                    }
                }
            }
        }

        this._data = plugins;
    }
}
