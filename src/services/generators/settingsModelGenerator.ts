import { PropertyIsRequired } from "./errors/propertyIsRequired";
import { GeneratorBase, Stubs, TemplateVars } from "./generatorBase";

export class SettingsModelGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'models/{{ model_pascal }}.php',
            template: require('./templates/settingsModel/class.twig')
        },
        fieldsConfig: {
            destination: 'models/{{ model_lower }}/fields.yaml',
            template: require('./templates/settingsModel/config/fields.twig'),
        }
    };

    protected setVars(vars: TemplateVars): void {
        if (!vars.model) {
            throw new PropertyIsRequired('Property "model" is required');
        }

        if (!vars.code) {
            throw new PropertyIsRequired('Property "code" is required');
        }

        super.setVars({
            model: vars.model,
            code: vars.code,
            placeFieldsInArray: !!vars.placeFieldsInArray
        });
    }

    protected needToMakeStub(stub: string): boolean {
        if (stub === 'fieldsConfig') {
            return !this.templateVars.placeFieldsInArray;
        }

        return true;
    }

}
