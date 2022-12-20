import * as vscode from 'vscode';
import { Owner } from '../owners/owner';
import { Behavior, ControllerBehavior } from './behavior';
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
}
