import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import classTwig from './templates/component/class.twig';
import defaultHtmTwig from './templates/component/default.htm.twig';

export class ComponentGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'components/{{ component_pascal }}.php',
            template: classTwig
        },
        defaultHtmTemplate: {
            destination: 'components/{{ component_lower }}/default.htm',
            template: defaultHtmTwig
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
