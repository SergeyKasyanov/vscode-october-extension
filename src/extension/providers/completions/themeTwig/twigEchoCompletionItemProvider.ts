import * as vscode from "vscode";
import { regExps } from "../../../../helpers/regExps";
import { ThemeFileUtils } from "../../../../helpers/themeFileUtils";
import { Platform } from "../../../../services/platform";
import { Project } from "../../../../services/project";
import { Themes } from "../../../../services/themes";
import { Component } from "../../../../types/plugin/component";
import { TwigFunction } from "../../../../types/twig/twigFunction";
import { ThemeMarkupFile } from "../../../../types/theme/themeFile";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";
import { isRightAfter } from "../../../helpers/isRightAfter";
import { LineSectionChecks } from "../../../helpers/lineSectionChecks";

/**
 * Completions for twig echo tag
 *
 * {{ *varName* }}
 * {{ *funcName*() }}
 * {{ funcName(*varName*) }}
 * {% partial 'partialName' prop = *varName* %}
 */
export class TwigEchoCompletionItemProvider implements vscode.CompletionItemProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;
    private thisFile: ThemeMarkupFile | undefined;

    private functions: TwigFunction[] = [];
    private components: { [alias: string]: Component } = {};
    private vars: string[] = [];
    private macros: string[] = [];

    private completions: vscode.CompletionItem[] = [];

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        const thisFile = Themes.instance.getFileByPath(document.fileName);
        if (!(thisFile instanceof ThemeMarkupFile)) {
            return;
        }

        this.thisFile = thisFile;

        if (!LineSectionChecks.insideTwigSection(document, position)) {
            return;
        }

        if (!this.awaitsVariable()) {
            return;
        }

        this.loadData();

        try {
            this.buildCompletions();
        } catch (err) {
            console.error(err);
        }

        return this.completions;
    }

    private awaitsVariable() {
        const beginStatement = isRightAfter(
            this.document!,
            this.position!,
            regExps.twigEchoStatementStartGlobal,
            regExps.spacesOrEmpty
        );

        const funcArgument = isRightAfter(
            this.document!,
            this.position!,
            regExps.funcArgumentStartGlobal,
            regExps.spacesOrEmpty
        );

        const tagArgValue = isRightAfter(
            this.document!,
            this.position!,
            regExps.tagArgumentStartGlobal,
            regExps.spacesOrEmpty
        );

        const objectValue = isRightAfter(
            this.document!,
            this.position!,
            regExps.objectStartGlobal,
            regExps.awaitsObjectValue
        );

        return beginStatement || funcArgument || tagArgValue || objectValue;
    }

    private loadData() {
        this.functions = [];
        this.components = {};
        this.vars = [];
        this.macros = [];

        this.functions = Object.values(Project.instance.getTwigFunctions())
            .filter(
                func => !func.minVersion
                    || !Platform.getInstance().currentVersion
                    || func.minVersion >= Platform.getInstance().currentVersion!
            );


        this.components = ThemeFileUtils.getComponents(this.thisFile!, true);

        this.vars = this.thisFile!.definedVars;

        // TODO: load macros
    }

    private buildCompletions() {
        this.completions = [];

        this.completions.push(...this.vars.map(
            variable => new vscode.CompletionItem(variable, vscode.CompletionItemKind.Variable)
        ));

        this.completions.push(...this.functions.map(
            func => CompletionItemFactory.fromTwigFunction(func)
        ));

        for (const alias in this.components) {
            if (Object.prototype.hasOwnProperty.call(this.components, alias)) {
                const comp = this.components[alias];

                this.completions.push(CompletionItemFactory.fromComponent(comp, alias));
            }
        }
    }
}
