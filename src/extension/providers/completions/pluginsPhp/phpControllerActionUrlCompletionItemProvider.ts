import { existsSync, readFileSync } from "fs";
import * as phpParser from 'php-parser';
import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, Position, ProviderResult, TextDocument } from "vscode";
import { getClassPropertiesFromDocument, getControllerPageMethodsFromDocument } from "../../../../helpers/parsePhp";
import { pluginsPath } from "../../../../helpers/paths";
import { ParsedPluginFileName, PluginFileUtils } from "../../../../helpers/pluginFileUtils";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { isRightAfter } from "../../../helpers/isRightAfter";
import path = require("path");

export class PhpControllerActionUrlCompletionItemProvider implements CompletionItemProvider {

    private parsedFileName?: ParsedPluginFileName;
    private document?: TextDocument;

    provideCompletionItems(
        document: TextDocument,
        position: Position,
        token: CancellationToken,
        context: CompletionContext
    ): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {

        this.document = document;
        this.parsedFileName = PluginFileUtils.parseFileName(document.fileName);
        if (this.parsedFileName?.directory !== 'controllers') {
            return;
        }

        if (!isRightAfter(document, position, regExps.phpActionUrlMethodGlobal, regExps.empty)) {
            return;
        }

        const controllerFileName = this.getControllerFileName();
        if (!controllerFileName) {
            return;
        }

        const controllersDir = pluginsPath(path.join(
            this.parsedFileName!.vendor!,
            this.parsedFileName!.plugin!,
            this.parsedFileName!.directory!
        ));
        const controllerPath = path.join(controllersDir, controllerFileName + '.php');
        if (!existsSync(controllerPath)) {
            return;
        }

        const code = readFileSync(controllerPath).toString();
        const methods = getControllerPageMethodsFromDocument(code, controllerPath);
        const behaviorsActions = this.getBehaviorsActions(code);

        let actions = [];
        if (methods) {
            actions.push(...Object.keys(methods));
        }
        if (behaviorsActions) {
            actions.push(...behaviorsActions);
        }

        return actions.map(action => new CompletionItem(action, CompletionItemKind.Method));
    }

    private getBehaviorsActions(code: string): string[] {
        const properties = getClassPropertiesFromDocument(code, this.document!.fileName);
        if (properties?.implement?.value?.kind !== 'array') {
            return [];
        }

        let actions: string[] = [];

        (properties.implement.value as phpParser.Array).items.forEach(entry => {
            const entryValue = (entry as phpParser.Entry).value;
            let behavior: string | undefined;

            if (entryValue.kind === 'string') {
                behavior = (entryValue as phpParser.String).value;
            } else if (entryValue.kind === 'staticlookup') {
                behavior = ((entryValue as phpParser.StaticLookup).what as phpParser.Name).name;
            }

            if (behavior?.includes('ListController')) {
                actions.push('index');
            } else if (behavior?.includes('FormController')) {
                actions.push('create', 'update', 'preview');
            } else if (behavior?.includes('ImportExportController')) {
                actions.push('import', 'export');
            } else if (behavior?.includes('ReorderController')) {
                actions.push('import');
            }
        });

        return actions;
    }

    private getControllerFileName() {
        const pluginControllers = Project.instance.getControllersByPlugin(this.parsedFileName!.pluginCode);

        for (const c of pluginControllers) {
            if (c.toLowerCase() === this.parsedFileName!.classNameWithoutExt.toLowerCase()) {
                return c;
            }
        }
    }
}
