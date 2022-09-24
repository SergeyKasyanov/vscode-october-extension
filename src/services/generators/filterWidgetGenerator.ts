import { PropertyIsRequired } from "./errors/propertyIsRequired";
import { GeneratorBase, Stubs, TemplateVars } from "./generatorBase";

export class FilterWidgetGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'filterwidgets/{{ widget_pascal }}.php',
            template: require('./templates/filterWidget/class.twig')
        },
        defaultPartial: {
            destination: 'filterwidgets/{{ widget_lower }}/partials/_{{ widget_snake }}.php',
            template: require('./templates/filterWidget/partial.twig')
        },
        formPartial: {
            destination: 'filterwidgets/{{ widget_lower }}/partials/_{{ widget_snake }}_form.php',
            template: require('./templates/filterWidget/partial_form.twig')
        },
        styleCss: {
            destination: 'filterwidgets/{{ widget_lower }}/assets/css/{{ widget_snake }}.css',
            template: require('./templates/filterWidget/style.twig')
        },
        scriptJs: {
            destination: 'filterwidgets/{{ widget_lower }}/assets/js/{{ widget_snake }}.js',
            template: require('./templates/filterWidget/script.twig')
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
