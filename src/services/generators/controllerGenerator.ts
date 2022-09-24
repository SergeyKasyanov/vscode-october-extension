import * as pluralize from "pluralize";
import { isBackendControllerStructured } from "../../config";
import { Platform } from "../platform";
import { PropertyIsRequired } from "./errors/propertyIsRequired";
import { GeneratorBase, Stubs, TemplateVars } from "./generatorBase";

export class ControllerGenerator extends GeneratorBase {

    protected stubs: Stubs = {
        classTemplate: {
            destination: 'controllers/{{ controller_pascal }}.php',
            template: require('./templates/controller/class.twig'),
        },
    };

    constructor(protected pluginName: string, vars: TemplateVars = {}) {
        super(pluginName, vars);

        const ext = Platform.getInstance().getMainBackendViewExtension();
        const structured = isBackendControllerStructured();

        // VIEWS
        this.stubs.viewIndex = {
            destination: 'controllers/{{ controller_lower }}/index.' + ext,
            template: require('./templates/controller/views/index.twig')
        };
        this.stubs.viewCreate = {
            destination: 'controllers/{{ controller_lower }}/create.' + ext,
            template: require('./templates/controller/views/create.twig')
        };
        this.stubs.viewUpdate = {
            destination: 'controllers/{{ controller_lower }}/update.' + ext,
            template: require('./templates/controller/views/update.twig')
        };
        this.stubs.viewPreview = {
            destination: 'controllers/{{ controller_lower }}/preview.' + ext,
            template: require('./templates/controller/views/preview.twig')
        };
        this.stubs.viewImport = {
            destination: 'controllers/{{ controller_lower }}/import.' + ext,
            template: require('./templates/controller/views/import.twig')
        };
        this.stubs.viewExport = {
            destination: 'controllers/{{ controller_lower }}/export.' + ext,
            template: require('./templates/controller/views/export.twig')
        };

        // CONFIG FILES
        this.stubs.configList = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/config/list.yaml'
                : 'controllers/{{ controller_lower }}/config_list.yaml',
            template: require('./templates/controller/config/list.twig')
        };
        this.stubs.configListFilter = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/config/filter.yaml'
                : 'controllers/{{ controller_lower }}/config_filter.yaml',
            template: require('./templates/controller/config/filter.twig')
        };
        this.stubs.configForm = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/config/form.yaml'
                : 'controllers/{{ controller_lower }}/config_form.yaml',
            template: require('./templates/controller/config/form.twig')
        };
        this.stubs.configRelation = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/config/relation.yaml'
                : 'controllers/{{ controller_lower }}/config_relation.yaml',
            template: require('./templates/controller/config/relation.twig')
        };
        this.stubs.configImportExport = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/config/import_export.yaml'
                : 'controllers/{{ controller_lower }}/config_import_export.yaml',
            template: require('./templates/controller/config/import_export.twig')
        };

        // PARTIALS
        this.stubs.partialListToolbar = {
            destination: structured
                ? 'controllers/{{ controller_lower }}/partials/_list_toolbar.' + ext
                : 'controllers/{{ controller_lower }}/_list_toolbar.' + ext,
            template: require('./templates/controller/partials/list_toolbar.twig')
        };

        if (structured) {
            this.stubs.partialBreadcrumb = {
                destination: 'controllers/{{ controller_lower }}/partials/_breadcrumb.' + ext,
                template: require('./templates/controller/partials/breadcrumb.twig')
            };
            this.stubs.partialError = {
                destination: 'controllers/{{ controller_lower }}/partials/_error.' + ext,
                template: require('./templates/controller/partials/error.twig')
            };
        }
    }

    protected setVars(vars: TemplateVars): void {
        if (!vars.controller) {
            throw new PropertyIsRequired('Property "controller" is required');
        }

        super.setVars({
            controller: vars.controller,
            model: vars.model || pluralize.singular(vars.controller.toString()),
            structured: isBackendControllerStructured(),
            addListControllerBehavior: !!vars.addListControllerBehavior,
            addStructure: !!vars.addStructure,
            addListFilter: !!vars.addListFilter,
            addFormControllerBehavior: !!vars.addFormControllerBehavior,
            addRelationControllerBehavior: !!vars.addRelationControllerBehavior,
            addImportExportControllerBehavior: !!vars.addImportExportControllerBehavior,
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
