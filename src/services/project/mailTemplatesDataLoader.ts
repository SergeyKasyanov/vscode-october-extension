import * as fs from "fs";
import path = require("path");
import * as vscode from "vscode";
import { pluginsPath } from "../../helpers/paths";
import { readDirectoryRecursively } from "../../helpers/readDirectoryRecursively";

export class MailTemplatesDataLoader {

    private static _instance: MailTemplatesDataLoader;
    private _templates: { [name: string]: string } = {};

    private constructor() {
        this.loadTemplates();

        this.startWatcher();
    }

    public static get instance(): MailTemplatesDataLoader {
        if (!this._instance) {
            this._instance = new MailTemplatesDataLoader();
        }

        return this._instance;
    }

    public get templates() {
        return this._templates;
    }

    public refreshData() {
        this.loadTemplates();
    }

    private loadTemplates() {
        const templates: { [name: string]: string } = {};

        fs.readdirSync(pluginsPath(), { withFileTypes: true }).forEach(vendor => {
            if (!vendor.isDirectory()) {
                return;
            }

            fs.readdirSync(pluginsPath(vendor.name), { withFileTypes: true }).forEach(plugin => {
                if (!plugin.isDirectory()) {
                    return;
                }

                const viewsPath = pluginsPath([vendor.name, plugin.name, 'views'].join(path.sep));
                if (!fs.existsSync(viewsPath)) {
                    return;
                }

                readDirectoryRecursively({ dir: viewsPath, exts: ['htm'] }).forEach(tpl => {
                    const name = [vendor.name, plugin.name].join('.') + '::' + tpl.slice(0, -4).replace(path.sep, '.');
                    templates[name] = name;
                });
            });
        });

        this._templates = templates;
    }

    private startWatcher() {
        const pattern = new vscode.RelativePattern(pluginsPath(), path.join(
            '*', '*', 'views', '**', '*.htm'
        ));

        let watcher = vscode.workspace.createFileSystemWatcher(pattern);

        watcher.onDidCreate((e: vscode.Uri) => {
            console.debug('File created: ', e.path);

            const name = this.getName(e.path);

            this._templates[name] = name;
        });

        watcher.onDidDelete((e: vscode.Uri) => {
            console.debug('File deleted: ' + e.path);

            const name = this.getName(e.path);

            delete this._templates[name];
        });
    }

    getName(tplPath: string) {
        let splitted = tplPath.replace(pluginsPath(), '').split(path.sep);
        if (splitted[0] === '') {
            splitted.shift();
        }

        const vendor = splitted.shift();
        const plugin = splitted.shift();

        splitted.shift(); // views

        return vendor + '.' + plugin + '::' + splitted.join('.').slice(0, -4);
    }
}
