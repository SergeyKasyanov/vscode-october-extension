import * as fs from 'fs';
import path = require('path');
import * as phpParser from 'php-parser';
import { Behavior, ControllerBehavior, ModelBehavior } from "../../entities/classes/plugin/behavior";
import { Owner } from '../../entities/owners/owner';
import { PhpParserHelpers } from '../../helpers/php-parser-helpers';

/**
 * Behaviors directory reader
 */
export class BehaviorsIndexer {
    private owner: Owner | undefined;

    /**
     * Scan directory for controller's or model's behaviors
     *
     * @param directory
     * @returns
     */
    index(owner: Owner, directory: string): Behavior[] {
        this.owner = owner;

        const behaviors: Behavior[] = [];

        fs.readdirSync(directory, { withFileTypes: true })
            .filter(entry => entry.isFile() && entry.name.endsWith('.php'))
            .map(file => {
                const behavior = this.loadBehavior(path.join(directory, file.name));
                if (behavior instanceof ModelBehavior || behavior instanceof ControllerBehavior) {
                    behaviors.push(behavior);
                }
            });

        return behaviors;
    }

    private loadBehavior(classPath: string): Behavior | undefined {
        const content = fs.readFileSync(classPath).toString();
        if (!content.length) {
            return;
        }

        const phpClass = PhpParserHelpers.getClass(content, classPath);
        if (!phpClass || !phpClass.extends) {
            return;
        }

        let behavior: Behavior | undefined;

        const uses = PhpParserHelpers.getUsesList(content, classPath);
        const parentName = phpClass.extends.name;
        const parentFqn = uses[parentName];

        if (parentFqn === 'Backend\\Classes\\ControllerBehavior') {
            behavior = new ControllerBehavior(this.owner!, PhpParserHelpers.identifierToString(phpClass.name), classPath);
        } else if (parentFqn === 'Backend\\Classes\\ModelBehavior') {
            behavior = new ModelBehavior(this.owner!, PhpParserHelpers.identifierToString(phpClass.name), classPath);
        } else {
            return;
        }

        const requiredProperties: string[] = [];

        const properties = PhpParserHelpers.getProperties(phpClass);
        if (properties.requiredProperties && properties.requiredProperties.value?.kind === 'array') {
            for (const item of (properties.requiredProperties.value as phpParser.Array).items) {
                requiredProperties.push(((item as phpParser.Entry).value as phpParser.String).value);
            }
        }

        behavior.requiredProperties = requiredProperties;

        return behavior;
    }
}
