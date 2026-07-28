import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import template from './templates/import-model/class.twig';

export class ImportModelGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'models/{{ model_pascal }}Import.php',
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
