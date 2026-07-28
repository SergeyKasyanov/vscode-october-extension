import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import classTwig from './templates/settings-model/class.twig';
import configFieldsTwig from './templates/settings-model/config/fields.twig';

export class SettingsModelGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'models/{{ model_pascal }}.php',
            template: classTwig
        },
        fieldsConfig: {
            destination: 'models/{{ model_lower }}/fields.yaml',
            template: configFieldsTwig,
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
            placeFieldsInArray: !!vars.placeFieldsInArray,
            usesSettingModel: !!this.project.platform?.usesSettingModel,
        });
    }

    protected needToMakeStub(stub: string): boolean {
        if (stub === 'fieldsConfig') {
            return !this.templateVars.placeFieldsInArray;
        }

        return true;
    }

}
