import * as pluralize from "pluralize";
import { snakeCase } from "../../helpers/str";
import { PropertyIsRequired } from "./errors/propertyIsRequired";
import { GeneratorBase, Stubs, TemplateVars } from "./generatorBase";

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

        let author, plugin;
        [author, plugin] = this.pluginName.split('.');

        const table = vars.table || [
            author.toLowerCase(),
            snakeCase(plugin),
            snakeCase(pluralize.plural(vars.model.toString()))
        ].join('_');

        super.setVars({
            model: vars.model,
            table,
            plural: pluralize.plural(vars.model.toString()),
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
