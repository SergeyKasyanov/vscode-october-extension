import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Behavior, ControllerBehavior, ModelBehavior } from '../../entities/classes/behavior';
import { Module } from '../../entities/owners/module';
import { BehaviorIndexer } from './classes/behavior-indexer';

/**
 * Indexer for modules
 */
export class ModulesIndexer {

    private behaviorLoader: BehaviorIndexer;

    private modulesPath: string = '';

    constructor() {
        this.behaviorLoader = new BehaviorIndexer;
    }

    index(wsFolder: vscode.WorkspaceFolder) {
        this.modulesPath = path.join(wsFolder.uri.path, 'modules');

        let modules: Module[] = [];

        const modulesDirectories = this.getModules(wsFolder);

        for (const moduleDirectory of modulesDirectories) {
            const behaviors = this.loadBehaviors(moduleDirectory);
        }

    }

    private getModules(wsFolder: vscode.WorkspaceFolder): string[] {
        return fs.readdirSync(this.modulesPath, { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    }

    private loadBehaviors(moduleName: string): Behavior[] {
        const behaviorsPath = path.join(this.modulesPath, moduleName, 'behaviors');

        if (!fs.existsSync(behaviorsPath)) {
            return [];
        }

        let behaviors = [];

        const behaviorsNames = fs.readdirSync(behaviorsPath, { withFileTypes: true })
            .filter(entry => entry.isFile() && entry.name.endsWith('.php'))
            .map(file => file.name);

        for (const behName of behaviorsNames) {
            const behavior = this.behaviorLoader.index(
                path.join(behaviorsPath, behName)
            );

            if (behavior instanceof ModelBehavior || behavior instanceof ControllerBehavior) {
                behaviors.push(behavior);
            }
        }

        return behaviors;
    }
}
