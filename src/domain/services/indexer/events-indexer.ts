import { FsHelpers } from '../../helpers/fs-helpers';
import { PathHelpers } from '../../helpers/path-helpers';
import { Store } from '../store';
import path = require('path');

const EVENT_FIRE = /(Event::fire|->fireSystemEvent|->fireViewEvent)\s*\(\s*[\'\"][\w\-\_\.\:]+[\'\"]/g;
const EVENT_NAME = /[\'\"][\w\-\_\.\:]+[\'\"]/;

export class EventIndexer {
    constructor(
        private store: Store
    ) { }

    /**
     * Index global events in project
     *
     * @param projectPath
     */
    index(projectPath: string): void {
        [
            PathHelpers.appPath(projectPath),
            PathHelpers.modulesPath(projectPath),
            PathHelpers.pluginsPath(projectPath),
            PathHelpers.rootPath(projectPath, path.join('vendor', 'october', 'rain', 'src'))
        ].forEach(dir => {
            if (!FsHelpers.exists(dir) || !FsHelpers.isDirectory(dir)) {
                return;
            }

            const files = FsHelpers.listFiles(dir, true, ['php', 'htm']);

            for (const file of files) {
                this.indexFile(projectPath, path.join(dir, file));
            }
        });
    }

    /**
     * Index events from single file
     *
     * @param projectPath
     * @param filePath
     */
    indexFile(projectPath: string, filePath: string) {
        this.deleteFile(projectPath, filePath);

        const fileContent = FsHelpers.readFile(path.join(filePath));
        const fireMatches = [...fileContent.matchAll(EVENT_FIRE)];
        if (fireMatches.length === 0) {
            return;
        }

        for (const match of fireMatches) {
            const calling = match[0];
            const eventMatch = calling.match(EVENT_NAME);

            this.store.addEvent(projectPath, {
                name: eventMatch![0].slice(1, -1),
                filePath,
                offset: match.index! + eventMatch!.index! + 1
            });
        }
    }

    /**
     * Delete events from file
     *
     * @param projectPath
     * @param file
     */
    deleteFile(projectPath: string, filePath: string) {
        const project = this.store.findProject(projectPath);
        if (project) {
            project.events = project.events.filter(ev => ev.filePath !== filePath);
        }
    }
}
