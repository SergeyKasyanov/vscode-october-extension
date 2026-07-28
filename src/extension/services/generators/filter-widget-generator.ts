import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import classTwig from './templates/filter-widget/class.twig';
import partialTwig from './templates/filter-widget/partial.twig';
import partialFormTwig from './templates/filter-widget/partial_form.twig';
import scriptTwig from './templates/filter-widget/script.twig';
import styleTwig from './templates/filter-widget/style.twig';

export class FilterWidgetGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'filterwidgets/{{ widget_pascal }}.php',
            template: classTwig
        },
        defaultPartial: {
            destination: 'filterwidgets/{{ widget_lower }}/partials/_{{ widget_snake }}.php',
            template: partialTwig
        },
        formPartial: {
            destination: 'filterwidgets/{{ widget_lower }}/partials/_{{ widget_snake }}_form.php',
            template: partialFormTwig
        },
        styleCss: {
            destination: 'filterwidgets/{{ widget_lower }}/assets/css/{{ widget_snake }}.css',
            template: styleTwig
        },
        scriptJs: {
            destination: 'filterwidgets/{{ widget_lower }}/assets/js/{{ widget_snake }}.js',
            template: scriptTwig
        },
    };

    protected setVars(vars: TemplateVars): void {
        if (!vars.widget) {
            throw new PropertyIsRequired('Property "widget" is required');
        }

        super.setVars({
            widget: vars.widget,
            addAssets: !!vars.addAssets
        });
    }

    protected needToMakeStub(stub: string): boolean {
        if (['styleCss', 'scriptJs'].includes(stub)) {
            return !!this.templateVars.addAssets;
        }

        return true;
    }

}
