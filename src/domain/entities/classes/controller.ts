import * as phpParser from 'php-parser';
import * as vscode from 'vscode';
import { PathHelpers } from '../../helpers/path-helpers';
import { AppDirectory } from '../owners/app-directory';
import { Module } from '../owners/module';
import { Owner } from '../owners/owner';
import { Plugin } from '../owners/plugin';
import { ControllerBehavior } from './behavior';
import { HasAjaxMethods } from './concerns/has-ajax-methods';
import { BehaviorsList, HasBehaviors } from './concerns/has-behaviors';
import { OctoberClass } from "./october-class";
import path = require('path');

/**
 * Represents controller class in plugin, module or app
 */
export class Controller extends OctoberClass {

    private hasAjaxMethods: HasAjaxMethods;
    private hasBehaviors: HasBehaviors;

    private _pageMethods: { [name: string]: vscode.Range } = {};

    constructor(
        protected _owner: Owner,
        protected _path: string,
        protected _name: string,
    ) {
        super(_owner, _path, _name);

        this.hasAjaxMethods = new HasAjaxMethods(this);
        this.hasBehaviors = new HasBehaviors(this);
    }

    /**
     * Directory containing controllers of plugin/module
     *
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['controllers'];
    }

    /**
     * Ajax methods of this controller
     */
    get ajaxMethods() {
        return this.hasAjaxMethods.ajaxMethods;
    }

    /**
     * Used behaviors
     */
    get behaviors(): BehaviorsList<ControllerBehavior> {
        return this.hasBehaviors.behaviors as BehaviorsList<ControllerBehavior>;
    }

    /**
     * Path to class's views and configs directory
     */
    get filesDirectory(): string {
        return path.join(this.owner.path, 'controllers', this.uqn.toLowerCase());
    }

    /**
     * List of public methods not having `__` or `_on` in name with ranges in code
     *
     * @returns
     */
    get pageMethods(): { [name: string]: vscode.Range } {
        const classMethods = this.phpClassMethods;
        if (!classMethods) {
            this._pageMethods = {};
            return {};
        }

        try {
            const pageMethods: { [name: string]: vscode.Range } = {};

            for (const methodName in classMethods) {
                if (Object.prototype.hasOwnProperty.call(classMethods, methodName)) {
                    const method = classMethods[methodName];

                    // skip __magic and page_onAjax methods
                    if (methodName.startsWith('__') ||
                        methodName.startsWith('on') ||
                        methodName.includes('_on')
                    ) {
                        continue;
                    }

                    // only for public methods
                    if (method.visibility !== 'public' || !method.loc) {
                        continue;
                    }

                    pageMethods[methodName] = new vscode.Range(
                        new vscode.Position(method.loc!.start.line, method.loc!.start.column + 1),
                        new vscode.Position(method.loc!.end.line, method.loc!.end.column + 1)
                    );
                }
            }

            this._pageMethods = pageMethods;
        } catch (err) {
            console.error(err);
        }

        return this._pageMethods;
    }

    /**
     * Path to behavior config file
     */
    getBehaviorConfigPath(behaviorFqn: string): string | undefined {
        const value = this.hasBehaviors.getConfigsPath(behaviorFqn);
        if (!value) {
            return;
        }

        const properties = this.phpClassProperties;
        const relationConfig = properties?.relationConfig;
        if (!relationConfig || relationConfig.value?.kind !== 'string') {
            return;
        }

        let configPath = (relationConfig.value as phpParser.String).value;
        if (configPath.length === 0) {
            return;
        }

        if (configPath.startsWith('~')) {
            // ex: ~/plugins/my/blog/controllers/posts/config_relation.yaml

            configPath = configPath.slice(1);
            if (configPath.startsWith('/')) {
                configPath = configPath.slice(1);
            }

            configPath = configPath.split('/').join(path.sep);
            configPath = PathHelpers.rootPath(this.owner.project.path, configPath);
        } else if (configPath.startsWith('$')) {
            // ex: $/my/blog/controllers/posts/config_relation.yaml

            configPath = configPath.slice(1);
            if (configPath.startsWith('/')) {
                configPath = configPath.slice(1);
            }

            configPath = configPath.split('/').join(path.sep);

            if (this.owner instanceof Plugin) {
                configPath = PathHelpers.pluginsPath(this.owner.project.path, configPath);
            } else if (this.owner instanceof AppDirectory) {
                configPath = PathHelpers.appPath(this.owner.project.path, configPath);
            } else if (this.owner instanceof Module) {
                configPath = PathHelpers.modulesPath(this.owner.project.path, configPath);
            }
        } else {
            // ex: config/relation.yaml

            configPath = configPath.split('/').join(path.sep);
            configPath = path.join(this.owner.path, 'controllers', this.uqn.toLowerCase(), configPath);
        }

        return configPath;
    }
}
