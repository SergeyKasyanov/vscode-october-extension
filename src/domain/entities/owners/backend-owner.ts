import * as phpParser from 'php-parser';
import { FsHelpers } from "../../helpers/fs-helpers";
import { PhpHelpers } from "../../helpers/php-helpers";
import { ControllerBehavior, ModelBehavior } from "../classes/behavior";
import { Command } from "../classes/command";
import { Component } from "../classes/component";
import { Controller } from "../classes/controller";
import { Migration } from "../classes/migration";
import { Model } from "../classes/model";
import { OctoberClass } from "../classes/october-class";
import { FilterWidget, FormWidget, ReportWidget, Widget } from "../classes/widget";
import { Navigation, Permission } from "../types";
import { Owner } from "./owner";
import path = require("path");

/**
 * Base class for backend owners (app/module/plugin)
 */
export abstract class BackendOwner extends Owner {
    commands: Command[] = [];
    components: Component[] = [];
    controllerBehaviors: ControllerBehavior[] = [];
    controllers: Controller[] = [];
    filterWidgets: FilterWidget[] = [];
    formWidgets: FormWidget[] = [];
    migrations: Migration[] = [];
    modelBehaviors: ModelBehavior[] = [];
    models: Model[] = [];
    reportWidgets: ReportWidget[] = [];
    widgets: Widget[] = [];

    private _views: string[] = [];
    private _permissions: Permission[] = [];
    private _navigation: Navigation = {};

    configKeys: string[] = [];
    langs: string[] = [];

    /**
     * Backend menu context owner
     */
    abstract get contextOwner(): string;

    /**
     * List of owner's views
     */
    get views(): string[] {
        const viewsDir = path.join(this.path, 'views');
        if (!FsHelpers.exists(viewsDir)) {
            return this._views;
        }

        const prefix = this.name.toLowerCase() + '::';

        try {
            this._views = FsHelpers
                .listFiles(viewsDir, true)
                .filter(filename => filename.endsWith('.php') || filename.endsWith('.htm'))
                .map(filename => {
                    return prefix + filename.substring(0, filename.length - 4).replace(path.sep, '.');
                });
        } catch (err) {
            console.error(err);
        }

        return this._views;
    }

    /**
     * List of permissions defined in owner
     */
    get permissions(): Permission[] {
        const content = this.registrationFileContent;
        if (!content) {
            this._permissions = [];
            return this._permissions;
        }

        const phpClass = PhpHelpers.getClass(content, this.registrationFilePath);
        if (!phpClass) {
            this._permissions = [];
            return this._permissions;
        }

        const registerPermissions = PhpHelpers.getMethods(phpClass).registerPermissions;
        if (!registerPermissions) {
            this._permissions = [];
            return this._permissions;
        }

        const returnExpr = registerPermissions.body?.children.find(el => el.kind === 'return') as phpParser.Return;
        if (!returnExpr) {
            this._permissions = [];
            return this._permissions;
        }

        let returnArray: phpParser.Array | undefined;

        // hack for tailor module
        if (this.name === 'tailor'
            && returnExpr.expr?.kind === 'bin'
            && (returnExpr.expr as phpParser.Bin).left.kind === 'array'
        ) {
            returnArray = (returnExpr.expr as phpParser.Bin).left as phpParser.Array;
        } else if (returnExpr?.expr?.kind === 'array') {
            returnArray = returnExpr.expr as phpParser.Array;
        }

        if (!returnArray) {
            return this._permissions;
        }

        const permissions: Permission[] = [];

        returnArray.items.forEach(_item => {
            const item = _item as phpParser.Entry;

            if (item.key?.kind !== 'string') {
                return;
            }

            const code = (item.key as phpParser.String).value;

            if (item.value.kind === 'array') {
                const details = PhpHelpers.phpArrayToObject(item.value as phpParser.Array);

                permissions.push({
                    code,
                    label: details.label,
                    comment: details.comment
                });
            } else {
                permissions.push({ code });
            }
        });

        this._permissions = permissions;

        return this._permissions;
    }

    /**
     * Navigation items registered in owner
     */
    get navigation(): Navigation {
        const content = this.registrationFileContent;
        if (!content) {
            this._navigation = {};
            return {};
        }

        const phpClass = PhpHelpers.getClass(content, this.registrationFilePath);
        if (!phpClass) {
            this._navigation = {};
            return {};
        }

        const registerNavigation = PhpHelpers.getMethods(phpClass).registerNavigation;
        if (!registerNavigation) {
            this._navigation = {};
            return {};
        }

        const returnExpr = registerNavigation.body?.children.find(el => el.kind === 'return') as phpParser.Return;
        if (returnExpr?.expr?.kind !== 'array') {
            this._navigation = {};
            return {};
        }

        const nav: Navigation = {};

        (returnExpr.expr as phpParser.Array).items.forEach(_mainItem => {
            const mainItem = _mainItem as phpParser.Entry;
            if (mainItem.key?.kind !== 'string') {
                return;
            }

            const mainMenuKey = (mainItem.key as phpParser.String).value;
            nav[mainMenuKey] = [];

            if (mainItem.value.kind !== 'array') {
                return;
            }
            (mainItem.value as phpParser.Array).items.forEach(_mainItemDetail => {
                const mainItemDetail = _mainItemDetail as phpParser.Entry;
                if (mainItemDetail.key?.kind !== 'string') {
                    return;
                }

                if ((mainItemDetail.key as phpParser.String).value !== 'sideMenu') {
                    return;
                }

                if (mainItemDetail.value.kind !== 'array') {
                    return;
                }

                (mainItemDetail.value as phpParser.Array).items.forEach(_sideItem => {
                    const sideItem = _sideItem as phpParser.Entry;
                    if (sideItem.key?.kind !== 'string') {
                        return;
                    }

                    nav[mainMenuKey].push((sideItem.key as phpParser.String).value);
                });
            });
        });

        this._navigation = nav;

        return this._navigation;
    }

    /**
     * Find OctoberClass by it's path
     *
     * @param {string} filePath Path to file
     * @returns {OctoberClass|undefined} Found october class
     */
    findEntityByPath(filePath: string): OctoberClass | undefined {
        return this.commands.find(e => e.path === filePath)
            || this.components.find(e => e.path === filePath)
            || this.controllerBehaviors.find(e => e.path === filePath)
            || this.controllers.find(e => e.path === filePath)
            || this.filterWidgets.find(e => e.path === filePath)
            || this.formWidgets.find(e => e.path === filePath)
            || this.migrations.find(e => e.path === filePath)
            || this.modelBehaviors.find(e => e.path === filePath)
            || this.models.find(e => e.path === filePath)
            || this.reportWidgets.find(e => e.path === filePath)
            || this.widgets.find(e => e.path === filePath);
    }

    /**
     * Find OctoberClass by it's fqn
     *
     * @param fqn
     * @returns
     */
    findEntityByFqn(fqn: string) {
        return this.commands.find(e => e.fqn === fqn)
            || this.components.find(e => e.fqn === fqn)
            || this.controllerBehaviors.find(e => e.fqn === fqn)
            || this.controllers.find(e => e.fqn === fqn)
            || this.filterWidgets.find(e => e.fqn === fqn)
            || this.formWidgets.find(e => e.fqn === fqn)
            || this.migrations.find(e => e.fqn === fqn)
            || this.modelBehaviors.find(e => e.fqn === fqn)
            || this.models.find(e => e.fqn === fqn)
            || this.reportWidgets.find(e => e.fqn === fqn)
            || this.widgets.find(e => e.fqn === fqn);
    }

    /**
     * Find OctoberClass by path to it's view or config
     *
     * @param filePath
     * @returns
     */
    findEntityByRelatedName(filePath: string): OctoberClass | undefined {
        const filePathParts = filePath.substring(this.path.length + 1).split(path.sep);

        const baseDir = filePathParts.shift();
        if (!baseDir) {
            return;
        }

        const name = filePathParts.shift();
        if (!name) {
            return;
        }

        if (Component.getBaseDirectories().includes(baseDir)) {
            return this.components.find(c => c.uqn.toLowerCase() === name);
        }

        if (ControllerBehavior.getBaseDirectories().includes(baseDir)) {
            return this.controllerBehaviors.find(c => c.uqn.toLowerCase() === name);
        }

        if (Controller.getBaseDirectories().includes(baseDir)) {
            return this.controllers.find(c => c.uqn.toLowerCase() === name);
        }

        if (FilterWidget.getBaseDirectories().includes(baseDir)) {
            return this.filterWidgets.find(c => c.uqn.toLowerCase() === name);
        }

        if (FormWidget.getBaseDirectories().includes(baseDir)) {
            return this.formWidgets.find(c => c.uqn.toLowerCase() === name);
        }

        if (Model.getBaseDirectories().includes(baseDir)) {
            return this.models.find(c => c.uqn.toLowerCase() === name);
        }

        if (ReportWidget.getBaseDirectories().includes(baseDir)) {
            return this.reportWidgets.find(c => c.uqn.toLowerCase() === name);
        }

        if (Widget.getBaseDirectories().includes(baseDir)) {
            return this.widgets.find(c => c.uqn.toLowerCase() === name);
        }
    }
}
