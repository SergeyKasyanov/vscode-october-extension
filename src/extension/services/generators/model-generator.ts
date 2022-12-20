import { AppDirectory } from "../../../domain/entities/owners/app-directory";
import { Str } from "../../../helpers/str";
import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";

export class ModelGenerator extends GeneratorBase {
    protected stubs: Stubs = {
        classTemplate: {
            destination: 'models/{{ model_pascal }}.php',
            template: require('./templates/model/class.twig')
        },
        columnsConfig: {
            destination: 'models/{{ model_lower }}/columns.yaml',
            template: require('./templates/model/config/columns.twig'),
        },
        fieldsConfig: {
            destination: 'models/{{ model_lower }}/fields.yaml',
            template: require('./templates/model/config/fields.twig'),
        }
    };

    protected setVars(vars: TemplateVars): void {
        if (!vars.model) {
            throw new PropertyIsRequired('Property "model" is required');
        }

        const table = vars.table || (
            this.plugin instanceof AppDirectory
                ? 'app_' + Str.snakeCase(Str.plural(vars.model.toString()))
                : this.plugin!.author.toLowerCase() + '_' + Str.snakeCase(this.plugin!.nameWithoutAuthor) + '_' + Str.snakeCase(Str.plural(vars.model.toString()))
        );

        super.setVars({
            model: vars.model,
            table,
            plural: Str.plural(vars.model.toString()),
            adjacent: vars.adjacent || false,
            addColumnsConfig: !!vars.addColumnsConfig,
            addFieldsConfig: !!vars.addFieldsConfig,
            addTimestamps: !!vars.addTimestamps,
            addCasts: !!vars.addCasts,
            addRelations: !!vars.addRelations,
            addTraitNullable: !!vars.addTraitNullable,
            addTraitHashable: !!vars.addTraitHashable,
            addTraitPurgeable: !!vars.addTraitPurgeable,
            addTraitEncryptable: !!vars.addTraitEncryptable,
            addTraitSluggable: !!vars.addTraitSluggable,
            addTraitSortable: !!vars.addTraitSortable,
            addTraitSortableRelation: !!vars.addTraitSortableRelation,
            addTraitSimpleTree: !!vars.addTraitSimpleTree,
            addTraitNestedTree: !!vars.addTraitNestedTree,
            addTraitValidation: !!vars.addTraitValidation,
            addTraitSoftDelete: !!vars.addTraitSoftDelete,
            addTraitRevisionable: !!vars.addTraitRevisionable,
            addTraitMultisite: !!vars.addTraitMultisite,
        });
    }

    protected needToMakeStub(stub: string): boolean {
        if (stub === 'columnsConfig') {
            return !!this.templateVars.addColumnsConfig;
        }

        if (stub === 'fieldsConfig') {
            return !!this.templateVars.addFieldsConfig;
        }

        return true;
    }

}
