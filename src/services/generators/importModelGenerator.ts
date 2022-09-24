import { PropertyIsRequired } from "./errors/propertyIsRequired";
import { GeneratorBase, Stubs, TemplateVars } from "./generatorBase";

export class ImportModelGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'models/{{ model_pascal }}Import.php',
            template: require('./templates/importModel/class.twig')
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
