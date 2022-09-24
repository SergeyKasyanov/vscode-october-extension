import { Platform } from "../platform";
import { PropertyIsRequired } from "./errors/propertyIsRequired";
import { GeneratorBase, Stubs, TemplateVars } from "./generatorBase";

export class MigrationGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        migrationTemplate: {
            destination: 'updates/{{ migration_snake }}.php',
            template: require('./templates/migration/class.twig')
        },
    };

    protected setVars(vars: TemplateVars): void {

        if (!vars.migration) {
            throw new PropertyIsRequired('Property "migration" is required');
        }

        if (!vars.table) {
            throw new PropertyIsRequired('Property "table" is required');
        }

        if (!vars.action) {
            throw new PropertyIsRequired('Property "action" is required');
        }

        super.setVars({
            migration: vars.migration,
            table: vars.table,
            action: vars.action,
            addTimestamps: !!vars.addTimestamps,
            addSlug: !!vars.addSlug,
            addSortOrder: !!vars.addSortOrder,
            addSimpleTree: !!vars.addSimpleTree,
            addNestedTree: !!vars.addNestedTree,
            addSoftDelete: !!vars.addSoftDelete,
            usesTableId: !!Platform.getInstance().usesTableIdInMigrations()
        });
    }

}
