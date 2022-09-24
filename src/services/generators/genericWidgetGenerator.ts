import { Platform } from "../platform";
import { PropertyIsRequired } from "./errors/propertyIsRequired";
import { GeneratorBase, Stubs, TemplateVars } from "./generatorBase";

export class GenericWidgetGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'widgets/{{ widget_pascal }}.php',
            template: require('./templates/genericWidget/class.twig')
        },
        defaultPartial: {
            destination: 'widgets/{{ widget_lower }}/partials/_{{ widget_snake }}.',
            template: require('./templates/genericWidget/partial.twig')
        },
        styleCss: {
            destination: 'widgets/{{ widget_lower }}/assets/css/{{ widget_snake }}.css',
            template: require('./templates/genericWidget/style.twig')
        },
        scriptJs: {
            destination: 'widgets/{{ widget_lower }}/assets/js/{{ widget_snake }}.js',
            template: require('./templates/genericWidget/script.twig')
        },
    };

    constructor(protected pluginName: string, vars: TemplateVars = {}) {
        super(pluginName, vars);

        const ext = Platform.getInstance().getMainBackendViewExtension();

        this.stubs.defaultPartial.destination += ext;
    }

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
