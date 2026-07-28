import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import template from './templates/export-model/class.twig';

export class ExportModelGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'models/{{ model_pascal }}Export.php',
            template
        }
    };

    protected setVars(vars: TemplateVars): void {
        if (!vars.model) {
            throw new PropertyIsRequired('Property "model" is required');
        }

        super.setVars({
            model: vars.model,
        });
    }

}
