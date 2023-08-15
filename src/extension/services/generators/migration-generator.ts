import { AppDirectory } from "../../../domain/entities/owners/app-directory";
import { Project } from "../../../domain/entities/project";
import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";

export class MigrationGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        migrationTemplate: {
            destination: 'updates/{{ migration_snake }}.php',
            template: require('./templates/migration/class.twig')
        },
    };

    constructor(
        protected project: Project,
        protected pluginName: string,
        vars: TemplateVars = {}
    ) {
        super(project, pluginName, vars);

        if (this.plugin instanceof AppDirectory) {
            this.stubs.migrationTemplate.destination = 'database/migrations/{{ now }}_{{ migration_snake }}.php';
        }
    }

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

        const anonymousClass = this.project.platform?.supportAnonymousMigrations
            || this.plugin instanceof AppDirectory;

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
            addMultisite: !!vars.addMultisite,
            usesTableId: !!this.project.platform!.usesIdMethodInMigrations,
            anonymousClass,
            withTimezones: !!vars.withTimezones,
        });
    }

}
