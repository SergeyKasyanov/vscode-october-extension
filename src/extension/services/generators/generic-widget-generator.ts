import { Project } from "../../../domain/entities/project";
import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import classTwig from './templates/generic-widget/class.twig';
import partialTwig from './templates/generic-widget/partial.twig';
import styleTwig from './templates/generic-widget/style.twig';
import scriptTwig from './templates/generic-widget/script.twig';

export class GenericWidgetGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'widgets/{{ widget_pascal }}.php',
            template: classTwig
        },
        defaultPartial: {
            destination: 'widgets/{{ widget_lower }}/partials/_{{ widget_snake }}.',
            template: partialTwig
        },
        styleCss: {
            destination: 'widgets/{{ widget_lower }}/assets/css/{{ widget_snake }}.css',
            template: styleTwig
        },
        scriptJs: {
            destination: 'widgets/{{ widget_lower }}/assets/js/{{ widget_snake }}.js',
            template: scriptTwig
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
