import * as yaml from 'yaml';
import { Migration } from "../entities/classes/migration";
import { Plugin } from '../entities/owners/plugin';
import { FsHelpers } from '../helpers/fs-helpers';

/**
 * In which version is migration?
 *
 * @param migration
 * @returns
 */
export function getMigrationVersion(migration: Migration): string | undefined {
    if (!(migration.owner instanceof Plugin)) {
        return;
    }

    const versionYamlPath = migration.owner.versionYamlPath;

    if (!FsHelpers.exists(versionYamlPath)) {
        return;
    }

    const versionYaml = yaml.parse(FsHelpers.readFile(versionYamlPath));
    const relativePath = migration.pathInsideUpdates;

    for (const version in versionYaml) {
        if (Object.prototype.hasOwnProperty.call(versionYaml, version)) {
            const elements = versionYaml[version];
            if (!(elements instanceof Array)) {
                continue;
            }

            for (const el of elements) {
                if (el === relativePath) {
                    return version;
                }
            }
        }
    }
}
