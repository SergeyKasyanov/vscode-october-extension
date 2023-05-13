import * as yaml from 'yaml';
import { OctoberEntity } from './october-entity';

export class Blueprint extends OctoberEntity {

    /**
     * Blueprint uuid
     */
    get uuid(): string | undefined {
        return this.parse().uuid;
    }

    /**
     * Blueprint type
     */
    get type(): string | undefined {
        return this.parse().type;
    }

    /**
     * Blueprint handle
     */
    get handle(): string {
        return this._name;
    }

    /**
     * Blueprint handle
     */
    get entityName(): string | undefined {
        return this.parse().name;
    }

    /**
     * Parse blueprint's yaml file
     *
     * @returns
     */
    private parse(): any {
        try {
            return yaml.parse(this.fileContent!);
        } catch (err) {
            return {};
        }
    }
}
