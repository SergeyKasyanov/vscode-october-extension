import * as yaml from 'yaml';
import { Config } from "../../../config";
import { Blueprint } from "../../entities/blueprint";
import { Behavior, ControllerBehavior, ModelBehavior } from "../../entities/classes/behavior";
import { Command } from "../../entities/classes/command";
import { Component } from "../../entities/classes/component";
import { Controller } from "../../entities/classes/controller";
import { Migration } from "../../entities/classes/migration";
import { Model } from "../../entities/classes/model";
import { OctoberClass } from "../../entities/classes/october-class";
import { FilterWidget, FormWidget, ReportWidget, Widget } from "../../entities/classes/widget";
import { AppDirectory } from "../../entities/owners/app-directory";
import { BackendOwner } from "../../entities/owners/backend-owner";
import { Module } from "../../entities/owners/module";
import { Plugin } from "../../entities/owners/plugin";
import { Platform } from "../../entities/platform";
import { FsHelpers } from "../../helpers/fs-helpers";
import { PathHelpers } from "../../helpers/path-helpers";
import { Store } from "../store";
import { ControllerBehaviorsIndexer, ModelBehaviorsIndexer } from "./backend/behaviors-indexer";
import { CommandsIndexer } from "./backend/commands-indexer";
import { ComponentsIndexer } from "./backend/components-indexer";
import { ControllersIndexer } from "./backend/controllers-indexer";
import { DirectoryIndexer } from "./backend/directory-indexer";
import { MigrationsIndexer } from "./backend/migrations-indexer";
import { ModelsIndexer } from "./backend/models-indexer";
import { FilterWidgetsIndexer, FormWidgetsIndexer, ReportWidgetsIndexer, WidgetsIndexer } from "./backend/widgets-indexer";
import path = require("path");
/**
 * Indexes files in app,modules and plugins directories
 */
export class BackendIndexer {
    private excludes: string[];

    constructor(
        private store: Store
    ) {
        this.excludes = Config.excludeFromIndex;
    }

    /**
     * Index modules, plugins and app directory.
     *
     * @param platform
     * @param projectPath
     */
    index(platform: Platform, projectPath: string): void {
        if (platform.hasAppDirectory) {
            const appOwner = new AppDirectory('app', path.join(projectPath, 'app'));
            this.indexAppDirectory(projectPath, appOwner);
        }

        for (const module of this.listModules(projectPath)) {
            this.indexModule(projectPath, module);
        }

        for (const plugin of this.listPlugins(projectPath)) {
            this.indexPlugin(projectPath, plugin);
        }
    }

    /**
     * Index single file
     *
     * @param projectPath
     * @param filePath
     */
    indexFile(projectPath: string, filePath: string): void {
        const project = Store.instance.findProject(filePath);
        if (!project) {
            return;
        }

        const nameParts = filePath
            .replace(projectPath, '')
            .substring(1)
            .split(path.sep);

        const ownerType = nameParts.shift();
        let owner: BackendOwner | undefined;

        if (project.platform?.hasAppDirectory && ownerType === 'app') {
            owner = project.appDir;
            if (!owner) {
                try {
                    const appOwner = new AppDirectory('app', path.join(projectPath, 'app'));
                    this.indexOwner(appOwner);
                    if (appOwner.project.platform?.hasTailor) {
                        this.indexBlueprints(appOwner);
                    }
                    this.store.addAppDirectory(projectPath, appOwner);
                    return;
                } catch (err) {
                    console.error(err);
                }
            }
        } else if (ownerType === 'modules') {
            const ownerName = nameParts.shift();
            if (!ownerName) {
                return;
            }

            owner = project.modules.find(m => m.name === ownerName);
            if (!owner) {
                const module = new Module(ownerName, path.join(projectPath, 'modules', ownerName));
                this.indexOwner(module);
                this.store.addModule(projectPath, module);
                return;
            }

        } else if (ownerType === Config.pluginsDirectory) {
            const pluginVendor = nameParts.shift();
            const pluginName = nameParts.shift();
            if (!pluginVendor || !pluginName) {
                return;
            }

            const ownerName = pluginVendor + '.' + pluginName;

            owner = project.plugins.find(m => m.name === ownerName);
            if (!owner) {
                const plugin = new Plugin(ownerName, path.join(projectPath, Config.pluginsDirectory, pluginVendor, pluginName));
                this.indexOwner(plugin);
                this.store.addPlugin(projectPath, plugin);
                return;
            }
        }

        if (!owner) {
            return;
        }

        const dir = nameParts.shift();
        if (!dir) {
            return;
        }

        if (Behavior.getBaseDirectories().includes(dir)) {
            const controllerBehaviorExists = owner.controllerBehaviors.find(c => c.path === filePath);
            if (controllerBehaviorExists) { return; }

            const controllerBehavior = (new ControllerBehaviorsIndexer()).indexFile(owner, filePath);
            if (controllerBehavior instanceof ControllerBehavior) {
                owner.controllerBehaviors.push(controllerBehavior);
                return;
            }

            const modelBehaviorExists = owner.modelBehaviors.find(c => c.path === filePath);
            if (modelBehaviorExists) { return; }

            const modelBehavior = (new ModelBehaviorsIndexer()).indexFile(owner, filePath);
            if (modelBehavior instanceof ModelBehavior) {
                owner.modelBehaviors.push(modelBehavior);
                return;
            }

        } else if (Command.getBaseDirectories().includes(dir)) {
            const exists = owner.commands.find(c => c.path === filePath);
            if (exists) { return; }

            const ocClass = (new CommandsIndexer()).indexFile(owner, filePath);
            if (ocClass) { owner.commands.push(ocClass); }

        } else if (Component.getBaseDirectories().includes(dir)) {
            const exists = owner.components.find(c => c.path === filePath);
            if (exists) { return; }

            const ocClass = (new ComponentsIndexer()).indexFile(owner, filePath);
            if (ocClass) { owner.components.push(ocClass); }

        } else if (Controller.getBaseDirectories().includes(dir)) {
            const exists = owner.controllers.find(c => c.path === filePath);
            if (exists) { return; }

            const ocClass = (new ControllersIndexer()).indexFile(owner, filePath);
            if (ocClass) { owner.controllers.push(ocClass); }

        } else if (Migration.getBaseDirectories().includes(dir)) {
            const exists = owner.migrations.find(c => c.path === filePath);
            if (exists) { return; }

            const ocClass = (new MigrationsIndexer()).indexFile(owner, filePath);
            if (ocClass) { owner.migrations.push(ocClass); }

        } else if (Model.getBaseDirectories().includes(dir)) {
            const exists = owner.models.find(c => c.path === filePath);
            if (exists) { return; }

            const ocClass = (new ModelsIndexer()).indexFile(owner, filePath);
            if (ocClass) { owner.models.push(ocClass); }

        } else if (Widget.getBaseDirectories().includes(dir)) {
            const exists = owner.widgets.find(c => c.path === filePath);
            if (exists) { return; }

            const ocClass = (new WidgetsIndexer()).indexFile(owner, filePath);
            if (ocClass) { owner.widgets.push(ocClass); }

        } else if (FormWidget.getBaseDirectories().includes(dir)) {
            const exists = owner.formWidgets.find(c => c.path === filePath);
            if (exists) { return; }

            const ocClass = (new FormWidgetsIndexer()).indexFile(owner, filePath);
            if (ocClass) { owner.formWidgets.push(ocClass); }

        } else if (ReportWidget.getBaseDirectories().includes(dir)) {
            const exists = owner.reportWidgets.find(c => c.path === filePath);
            if (exists) { return; }

            const ocClass = (new ReportWidgetsIndexer()).indexFile(owner, filePath);
            if (ocClass) { owner.reportWidgets.push(ocClass); }

        } else if (FilterWidget.getBaseDirectories().includes(dir)) {
            const exists = owner.filterWidgets.find(c => c.path === filePath);
            if (exists) { return; }

            const ocClass = (new FilterWidgetsIndexer()).indexFile(owner, filePath);
            if (ocClass) { owner.filterWidgets.push(ocClass); }
        } else if (Blueprint.getBaseDirectories().includes(dir)) {
            this.indexBlueprints(owner as AppDirectory);
        }
    }

    /**
     * Delete file from Store
     *
     * @param filePath
     * @returns
     */
    deleteFile(filePath: string) {
        let entity;

        entity = Store.instance.findEntity(filePath);
        if (!(entity instanceof OctoberClass)) {
            const owner = Store.instance.findOwner(filePath);
            if (owner instanceof AppDirectory) {
                entity = owner.blueprints.find(b => b.path === filePath);
            }
        }

        if (!entity) {
            return;
        }

        if (entity instanceof ControllerBehavior) {
            entity.owner.controllerBehaviors = entity.owner.controllerBehaviors.filter(c => c.path !== filePath);
        } else if (entity instanceof ModelBehavior) {
            entity.owner.modelBehaviors = entity.owner.modelBehaviors.filter(c => c.path !== filePath);
        } else if (entity instanceof Command) {
            entity.owner.commands = entity.owner.commands.filter(c => c.path !== filePath);
        } else if (entity instanceof Component) {
            entity.owner.components = entity.owner.components.filter(c => c.path !== filePath);
        } else if (entity instanceof Controller) {
            entity.owner.controllers = entity.owner.controllers.filter(c => c.path !== filePath);
        } else if (entity instanceof Migration) {
            entity.owner.migrations = entity.owner.migrations.filter(c => c.path !== filePath);
        } else if (entity instanceof Model) {
            entity.owner.models = entity.owner.models.filter(c => c.path !== filePath);
        } else if (entity instanceof Widget) {
            entity.owner.widgets = entity.owner.widgets.filter(c => c.path !== filePath);
        } else if (entity instanceof FormWidget) {
            entity.owner.formWidgets = entity.owner.formWidgets.filter(c => c.path !== filePath);
        } else if (entity instanceof ReportWidget) {
            entity.owner.reportWidgets = entity.owner.reportWidgets.filter(c => c.path !== filePath);
        } else if (entity instanceof FilterWidget) {
            entity.owner.filterWidgets = entity.owner.filterWidgets.filter(c => c.path !== filePath);
        } else if (entity instanceof Blueprint) {
            const appDir = (entity.owner as AppDirectory);
            appDir.blueprints = appDir.blueprints.filter(b => b.path !== filePath);
        }
    }

    /**
     * Index app directory of opened project
     *
     * @param projectPath
     * @param appOwner
     */
    private indexAppDirectory(projectPath: string, appOwner: AppDirectory): void {
        try {
            this.indexOwner(appOwner);
            if (appOwner.project.platform?.hasTailor) {
                this.indexBlueprints(appOwner);
            }
            this.store.addAppDirectory(projectPath, appOwner);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Index module of opened project
     *
     * @param projectPath
     * @param module
     */
    private indexModule(projectPath: string, module: Module): void {
        try {
            this.indexOwner(module);
            this.store.addModule(projectPath, module);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Index plugin of opened project
     *
     * @param projectPath
     * @param plugin
     */
    private indexPlugin(projectPath: string, plugin: Plugin): void {
        try {
            this.indexOwner(plugin);
            this.store.addPlugin(projectPath, plugin);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * List modules of project
     *
     * @returns
     */
    private listModules(projectPath: string): Module[] {
        const modules: Module[] = [];

        FsHelpers
            .listDirectories(PathHelpers.modulesPath(projectPath))
            .map(dir => {
                const modulePath = path.join(projectPath, 'modules', dir);

                modules.push(new Module(dir, modulePath));
            });


        return modules;
    }

    /**
     * List plugins of project
     *
     * @returns
     */
    private listPlugins(projectPath: string): Plugin[] {
        const plugins: Plugin[] = [];

        FsHelpers
            .listDirectories(PathHelpers.pluginsPath(projectPath))
            .forEach(pluginVendor => {
                FsHelpers
                    .listDirectories(PathHelpers.pluginsPath(projectPath, pluginVendor))
                    .forEach(pluginName => {
                        const pluginPath = path.join(projectPath, Config.pluginsDirectory, pluginVendor, pluginName);
                        const pluginCode = [pluginVendor, pluginName].join('.');

                        plugins.push(new Plugin(pluginCode, pluginPath));
                    });
            });

        return plugins;
    }

    /**
     * Load data from module/plugin
     *
     * @param owner
     */
    private indexOwner(owner: BackendOwner): void {
        owner.commands = this.indexDirectories<Command>(owner, Command.getBaseDirectories(), new CommandsIndexer());
        owner.components = this.indexDirectories<Component>(owner, Component.getBaseDirectories(), new ComponentsIndexer());
        owner.controllerBehaviors = this.indexDirectories<ControllerBehavior>(owner, ControllerBehavior.getBaseDirectories(), new ControllerBehaviorsIndexer());
        owner.controllers = this.indexDirectories<Controller>(owner, Controller.getBaseDirectories(), new ControllersIndexer());
        owner.filterWidgets = this.indexDirectories<FilterWidget>(owner, FilterWidget.getBaseDirectories(), new FilterWidgetsIndexer());
        owner.formWidgets = this.indexDirectories<FormWidget>(owner, FormWidget.getBaseDirectories(), new FormWidgetsIndexer());
        owner.migrations = this.indexDirectories<Migration>(owner, Migration.getBaseDirectories(), new MigrationsIndexer(), true);
        owner.modelBehaviors = this.indexDirectories<ModelBehavior>(owner, ModelBehavior.getBaseDirectories(), new ModelBehaviorsIndexer());
        owner.models = this.indexDirectories<Model>(owner, Model.getBaseDirectories(), new ModelsIndexer());
        owner.reportWidgets = this.indexDirectories<ReportWidget>(owner, ReportWidget.getBaseDirectories(), new ReportWidgetsIndexer());
        owner.widgets = this.indexDirectories<Widget>(owner, Widget.getBaseDirectories(), new WidgetsIndexer());
    }

    /**
     * Index october classes directories
     *
     * @param owner
     * @param directories
     * @param directoryIndexer
     * @returns
     */
    private indexDirectories<T extends OctoberClass>(
        owner: BackendOwner,
        directories: string[],
        directoryIndexer: DirectoryIndexer<T>,
        includeSubdirectories: boolean = false
    ): T[] {
        const indexedClasses: T[] = [];

        for (const dir of directories) {
            const dirPath = path.join(owner.path, dir);
            if (this.excludes.includes(dir) || !FsHelpers.exists(dirPath)) {
                continue;
            }

            indexedClasses.push(...this.indexDirectory(
                owner,
                dirPath,
                directoryIndexer,
                includeSubdirectories
            ));
        }

        return indexedClasses;
    }

    /**
     * Index october classes directory
     *
     * @param owner
     * @param directory
     * @param directoryIndexer
     * @param includeSubdirectories
     * @returns
     */
    private indexDirectory<T extends OctoberClass>(
        owner: BackendOwner,
        directory: string,
        directoryIndexer: DirectoryIndexer<T>,
        includeSubdirectories: boolean = false
    ): T[] {
        try {
            const indexedClasses: T[] = [];

            if (includeSubdirectories) {
                FsHelpers.listDirectories(directory).forEach(subDir => {
                    indexedClasses.push(...this.indexDirectory(
                        owner,
                        path.join(directory, subDir),
                        directoryIndexer,
                        includeSubdirectories
                    ));
                });
            }

            indexedClasses.push(...directoryIndexer.index(owner, directory));

            return indexedClasses;
        } catch (err) {
            console.debug(err);

            return [];
        }
    }

    /**
     * Index tailor blueprints
     *
     * @param appOwner
     * @returns
     */
    private indexBlueprints(appOwner: AppDirectory) {
        const blueprintsPath = path.join(appOwner.path, 'blueprints');
        if (!FsHelpers.exists(blueprintsPath) || !FsHelpers.isDirectory(blueprintsPath)) {
            return [];
        }

        appOwner.blueprints = FsHelpers
            .listFiles(blueprintsPath, true, ['yaml'])
            .reduce((acc: Blueprint[], entry: string) => {
                try {
                    const filePath = path.join(blueprintsPath, entry);
                    const fileContent = FsHelpers.readFile(filePath);
                    const parsed = yaml.parse(fileContent);

                    if (parsed.handle) {
                        acc.push(new Blueprint(
                            appOwner,
                            filePath,
                            parsed.handle
                        ));
                    }
                } catch (err) {
                    console.log(err);
                }

                return acc;
            }, []);
    }
}
