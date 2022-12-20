import { Project } from "../../../domain/entities/project";
import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";

export class ReportWidgetGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'reportwidgets/{{ widget_pascal }}.php',
            template: require('./templates/report-widget/class.twig')
        },
        defaultPartial: {
            destination: 'reportwidgets/{{ widget_lower }}/partials/_{{ widget_snake }}.',
            template: require('./templates/report-widget/partial.twig')
        },
        styleCss: {
            destination: 'reportwidgets/{{ widget_lower }}/assets/css/{{ widget_snake }}.css',
            template: require('./templates/report-widget/style.twig')
        },
        scriptJs: {
            destination: 'reportwidgets/{{ widget_lower }}/assets/js/{{ widget_snake }}.js',
            template: require('./templates/report-widget/script.twig')
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
