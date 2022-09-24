import { PropertyIsRequired } from "./errors/propertyIsRequired";
import { GeneratorBase, Stubs, TemplateVars } from "./generatorBase";

export class ComponentGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'components/{{ component_pascal }}.php',
            template: require('./templates/component/class.twig')
        },
        defaultHtmTemplate: {
            destination: 'components/{{ component_lower }}/default.htm',
            template: require('./templates/component/default.htm.twig')
        }
    };

    protected setVars(vars: TemplateVars): void {

        if (!vars.component) {
            throw new PropertyIsRequired('Property "component" is required');
        }

        super.setVars({
            component: vars.component,
            description: vars.description,
            defineProperties: !!vars.defineProperties,
            init: !!vars.init,
            onRun: !!vars.onRun,
            hasMarkup: !!vars.hasMarkup,
        });
    }

    protected needToMakeStub(stub: string): boolean {
        if (stub === 'defaultHtmTemplate') {
            return !!this.templateVars.hasMarkup;
        }

        return true;
    }

}
