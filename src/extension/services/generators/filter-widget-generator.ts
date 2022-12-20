import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";

export class FilterWidgetGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'filterwidgets/{{ widget_pascal }}.php',
            template: require('./templates/filter-widget/class.twig')
        },
        defaultPartial: {
            destination: 'filterwidgets/{{ widget_lower }}/partials/_{{ widget_snake }}.php',
            template: require('./templates/filter-widget/partial.twig')
        },
        formPartial: {
            destination: 'filterwidgets/{{ widget_lower }}/partials/_{{ widget_snake }}_form.php',
            template: require('./templates/filter-widget/partial_form.twig')
        },
        styleCss: {
            destination: 'filterwidgets/{{ widget_lower }}/assets/css/{{ widget_snake }}.css',
            template: require('./templates/filter-widget/style.twig')
        },
        scriptJs: {
            destination: 'filterwidgets/{{ widget_lower }}/assets/js/{{ widget_snake }}.js',
            template: require('./templates/filter-widget/script.twig')
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
