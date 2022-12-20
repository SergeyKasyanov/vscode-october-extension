import { Project } from "../../../domain/entities/project";
import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";

export class GenericWidgetGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'widgets/{{ widget_pascal }}.php',
            template: require('./templates/generic-widget/class.twig')
        },
        defaultPartial: {
            destination: 'widgets/{{ widget_lower }}/partials/_{{ widget_snake }}.',
            template: require('./templates/generic-widget/partial.twig')
        },
        styleCss: {
            destination: 'widgets/{{ widget_lower }}/assets/css/{{ widget_snake }}.css',
            template: require('./templates/generic-widget/style.twig')
        },
        scriptJs: {
            destination: 'widgets/{{ widget_lower }}/assets/js/{{ widget_snake }}.js',
            template: require('./templates/generic-widget/script.twig')
        },
    };

    constructor(
        protected project: Project,
        protected pluginName: string,
        vars: TemplateVars = {}
    ) {
        super(project, pluginName, vars);

        const ext = project.platform!.mainBackendViewExtension;

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
