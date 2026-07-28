import { Config } from "../../../config";
import { Project } from "../../../domain/entities/project";
import { Str } from "../../../helpers/str";
import { PropertyIsRequired } from "./errors/property-is-required";
import { GeneratorBase, Stubs, TemplateVars } from "./generator-base";
import classTwig from './templates/controller/class.twig';
import configFilterTwig from './templates/controller/config/filter.twig';
import configFormTwig from './templates/controller/config/form.twig';
import configImportExportTwig from './templates/controller/config/import_export.twig';
import configListTwig from './templates/controller/config/list.twig';
import configRelationTwig from './templates/controller/config/relation.twig';
import partialsBreadcrumbTwig from './templates/controller/partials/breadcrumb.twig';
import partialsErrorTwig from './templates/controller/partials/error.twig';
import partialsListToolbarTwig from './templates/controller/partials/list_toolbar.twig';
import viewsCreateTwig from './templates/controller/views/create.twig';
import viewsExportTwig from './templates/controller/views/export.twig';
import viewsImportTwig from './templates/controller/views/import.twig';
import viewsIndexTwig from './templates/controller/views/index.twig';
import viewsPreviewTwig from './templates/controller/views/preview.twig';
import viewsUpdateTwig from './templates/controller/views/update.twig';

export class ControllerGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'controllers/{{ controller_pascal }}.php',
            template: classTwig,
        },
    };

    constructor(
        protected project: Project,
        protected pluginName: string,
        vars: TemplateVars = {}
    ) {
        super(project, pluginName, vars);

        const ext = project.platform!.mainBackendViewExtension;
        const structured = Config.isBackendControllerStructured;

        // VIEWS
        this.stubs.viewIndex = {
            destination: 'controllers/{{ controller_lower }}/index.' + ext,
            template: viewsIndexTwig
        };
        this.stubs.viewCreate = {
            destination: 'controllers/{{ controller_lower }}/create.' + ext,
            template: viewsCreateTwig
        };
        this.stubs.viewUpdate = {
            destination: 'controllers/{{ controller_lower }}/update.' + ext,
            template: viewsUpdateTwig
        };
        this.stubs.viewPreview = {
            destination: 'controllers/{{ controller_lower }}/preview.' + ext,
            template: viewsPreviewTwig
        };
        this.stubs.viewImport = {
            destination: 'controllers/{{ controller_lower }}/import.' + ext,
            template: viewsImportTwig
        };
        this.stubs.viewExport = {
            destination: 'controllers/{{ controller_lower }}/export.' + ext,
            template: viewsExportTwig
        };

        // CONFIG FILES
        this.stubs.configList = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/config/list.yaml'
                : 'controllers/{{ controller_lower }}/config_list.yaml',
            template: configListTwig
        };
        this.stubs.configListFilter = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/config/filter.yaml'
                : 'controllers/{{ controller_lower }}/config_filter.yaml',
            template: configFilterTwig
        };
        this.stubs.configForm = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/config/form.yaml'
                : 'controllers/{{ controller_lower }}/config_form.yaml',
            template: configFormTwig
        };
        this.stubs.configRelation = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/config/relation.yaml'
                : 'controllers/{{ controller_lower }}/config_relation.yaml',
            template: configRelationTwig
        };
        this.stubs.configImportExport = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/config/import_export.yaml'
                : 'controllers/{{ controller_lower }}/config_import_export.yaml',
            template: configImportExportTwig
        };

        // PARTIALS
        this.stubs.partialListToolbar = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/partials/_list_toolbar.' + ext
                : 'controllers/{{ controller_lower }}/_list_toolbar.' + ext,
            template: partialsListToolbarTwig
        };

        if (structured) {
            this.stubs.partialBreadcrumb = {
                destination: 'controllers/{{ controller_lower }}/partials/_breadcrumb.' + ext,
                template: partialsBreadcrumbTwig
            };
            this.stubs.partialError = {
                destination: 'controllers/{{ controller_lower }}/partials/_error.' + ext,
                template: partialsErrorTwig
            };
        }
    }

    protected setVars(vars: TemplateVars): void {
        if (!vars.controller) {
            throw new PropertyIsRequired('Property "controller" is required');
        }

        let errorWrapper: string | boolean = false;
        if (!!vars.hasSidebar) {
            if (this.project.platform?.usesBootstrap5) {
                errorWrapper = 'p-4';
            } else {
                errorWrapper = 'p-a';
            }
        }

        super.setVars({
            controller: vars.controller,
            model: vars.model || Str.singular(vars.controller.toString()),
            structured: Config.isBackendControllerStructured,
            addListControllerBehavior: !!vars.addListControllerBehavior,
            addStructure: !!vars.addStructure,
            addListFilter: !!vars.addListFilter,
            addFormControllerBehavior: !!vars.addFormControllerBehavior,
            addRelationControllerBehavior: !!vars.addRelationControllerBehavior,
            addImportExportControllerBehavior: !!vars.addImportExportControllerBehavior,
            hasSidebar: !!vars.hasSidebar,
            errorWrapper: errorWrapper
        });
    }

    protected needToMakeStub(stub: string): boolean {
        if (['configList', 'partialListToolbar'].includes(stub)) {
            return !!this.templateVars.addListControllerBehavior;
        }

        if (stub === 'configListFilter') {
            return !!this.templateVars.addListControllerBehavior && !!this.templateVars.addListFilter;
        }

        if (['viewCreate', 'viewUpdate', 'viewPreview', 'configForm'].includes(stub)) {
            return !!this.templateVars.addFormControllerBehavior;
        }

        if (['viewImport', 'viewExport', 'configImportExport'].includes(stub)) {
            return !!this.templateVars.addImportExportControllerBehavior;
        }

        if (stub === 'configRelation') {
            return !!this.templateVars.addRelationControllerBehavior;
        }

        if (['partialBreadcrumb', 'partialError'].includes(stub)) {
            return !!this.templateVars.addListControllerBehavior
                || !!this.templateVars.addFormControllerBehavior
                || !!this.templateVars.addImportExportControllerBehavior;
        }

        return true;
    }

}
