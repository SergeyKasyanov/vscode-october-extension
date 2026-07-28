import { Project } from "../../../domain/entities/project";
import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import classTwig from './templates/report-widget/class.twig';
import partialTwig from './templates/report-widget/partial.twig';
import scriptTwig from './templates/report-widget/script.twig';
import styleTwig from './templates/report-widget/style.twig';

export class ReportWidgetGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'reportwidgets/{{ widget_pascal }}.php',
            template: classTwig
        },
        defaultPartial: {
            destination: 'reportwidgets/{{ widget_lower }}/partials/_{{ widget_snake }}.',
            template: partialTwig
        },
        styleCss: {
            destination: 'reportwidgets/{{ widget_lower }}/assets/css/{{ widget_snake }}.css',
            template: styleTwig
        },
        scriptJs: {
            destination: 'reportwidgets/{{ widget_lower }}/assets/js/{{ widget_snake }}.js',
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
