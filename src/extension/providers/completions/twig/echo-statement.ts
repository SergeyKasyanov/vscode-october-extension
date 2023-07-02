import * as vscode from "vscode";
import { Page } from "../../../../domain/entities/theme/page";
import { Partial } from "../../../../domain/entities/theme/partial";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { twigFunctions } from "../../../../domain/static/twig-functions";
import { CompletionItem } from "../../../factories/completion-item";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const TWIG_ECHO_STATEMENT_START = /\{\{\s*/g;
const FUNC_ARG_START = /\{\{.+\w+\([\w*\'\"\-\.\(\),]*\s*/g;
const TAG_ARG_START = /\{\%\s*.*[\(=]\s*/g;
const IF_STMT_ARG = /{%\s*if\s*(?! is )/g;
const FOR_STMT_ARG = /{%\s*for\s+\w+(,\s*\w+){0,1}\s*in\s*/g;
const OBJECT_VALUE = /\{[\{\%].*\{\s*\w+:\s*(\s*.*,\s*\w+:\s*)*/g;
const VAR_NAME = /^\w*$/;

/**
 * Completions for twig echo tag
 *
 * {{ *varName* }}
 * {{ *funcName*() }}
 * {{ funcName(*varName*) }}
 * {% partial 'partialName' prop = *varName* %}
 */
export class EchoStatement implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideTwig(document.offsetAt(position))) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            [
                TWIG_ECHO_STATEMENT_START,
                FUNC_ARG_START,
                IF_STMT_ARG,
                FOR_STMT_ARG,
                TAG_ARG_START,
                OBJECT_VALUE
            ],
            VAR_NAME
        )) {
            return;
        }

        return this.buildCompletions(themeFile);
    }

    /**
     * Build completions for twig echo statement
     *
     * @param themeFile
     * @returns
     */
    private buildCompletions(themeFile: MarkupFile) {
        const completions: vscode.CompletionItem[] = themeFile.definedVars.map(
            varName => new vscode.CompletionItem(varName, vscode.CompletionItemKind.Variable)
        );

        if (themeFile instanceof Page && themeFile.layout) {
            completions.push(...themeFile.layout.definedVars.map(
                varName => new vscode.CompletionItem(varName, vscode.CompletionItemKind.Variable)
            ));
        }

        const components = themeFile.components;
        for (const alias in components) {
            if (Object.prototype.hasOwnProperty.call(components, alias)) {
                const component = components[alias];
                completions.push(CompletionItem.fromComponent(component, alias));
            }
        }

        if (themeFile instanceof Page && themeFile.layout) {
            const layoutComponents = themeFile.layout.components;
            for (const alias in layoutComponents) {
                if (Object.prototype.hasOwnProperty.call(layoutComponents, alias)) {
                    const component = layoutComponents[alias];
                    completions.push(CompletionItem.fromComponent(component, alias));
                }
            }
        }

        completions.push(...Object.values(twigFunctions).map(
            func => CompletionItem.fromTwigFunction(func)
        ));

        completions.push(...Object.values(themeFile.owner.project.twigFunctions).map(
            func => CompletionItem.fromTwigFunction(func)
        ));

        if (themeFile instanceof Partial) {
            completions.push(...themeFile.snippetProperties.map(p => new vscode.CompletionItem(p)));
        }

        return completions;
    }
}
