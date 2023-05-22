import path = require("path");
import { FsHelpers } from "../../helpers/fs-helpers";
import { PathHelpers } from "../../helpers/path-helpers";
import { Project } from "../project";

const EVENT_FIRE = /(Event::fire|->fireSystemEvent|->fireViewEvent)\s*\(\s*[\'\"][\w\-\_\.\:]+[\'\"]/g;
const EVENT_NAME = /[\'\"][\w\-\_\.\:]+[\'\"]/;

/**
 * Get global event names from project
 */
export function getEvents(project: Project): string[] {
    const events: string[] = [];

    project.modules.forEach(module => {
        events.push(...listFiredEvents(module.path));
    });

    project.plugins.forEach(plugin => {
        events.push(...listFiredEvents(plugin.path));
    });

    if (project.appDir) {
        events.push(...listFiredEvents(project.appDir.path));
    }

    const rainPath = PathHelpers.rootPath(project.path, path.join('vendor', 'october', 'rain', 'src'));
    events.push(...listFiredEvents(rainPath));

    return [...new Set(events)].sort();
}

function listFiredEvents(dir: string) {
    const events: string[] = [];

    FsHelpers.listFiles(dir, true, ['php', 'htm']).forEach(file => {
        const fileContent = FsHelpers.readFile(path.join(dir, file));
        const fireMatches = fileContent.matchAll(EVENT_FIRE);
        for (const match of fireMatches) {
            const calling = match[0];
            const event = calling.match(EVENT_NAME)![0].slice(1, -1);

            if (!events.includes(event)) {
                events.push(event);
            }
        }
    });

    return events;
}
