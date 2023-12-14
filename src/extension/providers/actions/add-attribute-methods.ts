import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { Position } from "vscode";
import { Model } from "../../../domain/entities/classes/model";
import { PhpHelpers } from "../../../domain/helpers/php-helpers";
import { Store } from "../../../domain/services/store";
import { Str } from "../../../helpers/str";
import { phpSelector } from "../../helpers/file-selectors";

const COMMAND_ADD_ATTRIBUTE_METHOD = 'command.addAttributeMethod';

export function registerAddAttributeMethods(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(phpSelector, new AddAttributeMethods));
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND_ADD_ATTRIBUTE_METHOD, addAttributeMethod));
}

/**
 * Code action for add accessor or mutator for model attribute
 */
export class AddAttributeMethods implements vscode.CodeActionProvider<vscode.CodeAction> {

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        if (!range.isEmpty) {
            return;
        }

        const cursor = range.start;

        const model = Store.instance.findEntity(document.fileName);
        if (!(model instanceof Model)) {
            return;
        }

        let attribute: string | undefined;

        const classProperty = this.getClassProperty(model, cursor);
        if (classProperty) {
            attribute = this.getAttribute(classProperty, cursor);
        } else {
            attribute = this.getDocAttribute(document, model, cursor);
        }

        if (!attribute || model.relations[attribute]) {
            return;
        }

        return this.getActions(document, model, attribute);
    }

    private getClassProperty(model: Model, position: vscode.Position) {
        const properties = model.phpClassProperties;
        if (!properties) {
            return;
        }

        if (properties.fillable?.value?.kind === 'array') {
            const propertyRange = this.locationToRange(properties.fillable.loc!);
            if (propertyRange.contains(position)) {
                return properties.fillable;
            }
        }

        if (properties.guarded?.value?.kind === 'array') {
            const propertyRange = this.locationToRange(properties.guarded.loc!);
            if (propertyRange.contains(position)) {
                return properties.guarded;
            }
        }
    }

    private getDocAttribute(
        document: vscode.TextDocument,
        model: Model,
        position: vscode.Position
    ): string | undefined {

        const wordRange = document.getWordRangeAtPosition(position, /\$\w+/);
        if (!wordRange) {
            return;
        }

        const line = document.lineAt(position.line).text;
        const tagMatch = line.match(/\s*\*\s*\@(property|property-read)/);
        if (!tagMatch) {
            return;
        }

        const attributeMatch = line.match(/\$\w+/);
        if (!attributeMatch) {
            return;
        }

        const attribute = attributeMatch[0];
        if (!attribute) {
            return;
        }

        const word = line.substring(wordRange.start.character, wordRange.end.character);
        if (attribute !== word) {
            return;
        }

        return attribute.slice(1);
    }

    private locationToRange(loc: phpParser.Location): vscode.Range {
        const start = new Position(loc.start.line - 1, loc.start.column);
        const end = new Position(loc.end.line - 1, loc.end.column);

        return new vscode.Range(start, end);
    }

    private getAttribute(
        property: phpParser.Property,
        position: vscode.Position
    ): string | undefined {

        for (const _entry of (property.value as phpParser.Array).items) {
            const entry = (_entry as phpParser.Entry);

            const entryIsValidNotEmptyString = entry.value?.kind === 'string'
                && (entry.value as phpParser.String).value.length > 0;

            if (entryIsValidNotEmptyString) {
                const valueRange = this.locationToRange(entry.value.loc!);
                if (valueRange.contains(position)) {
                    return (entry.value as phpParser.String).value;
                }
            }
        }
    }

    private getActions(
        document: vscode.TextDocument,
        model: Model,
        attribute: string,
    ): CodeAction[] {
        const actions = [];

        const methods = model.phpClassMethods;

        const accessorName = 'get' + Str.pascalCase(attribute) + 'Attribute';
        if (!(methods && methods[accessorName])) {
            const action = new CodeAction('Add accessor', vscode.CodeActionKind.Refactor);
            action.document = document;
            action.attribute = attribute;
            action.methodName = accessorName;
            action.methodType = 'accessor';

            actions.push(action);
        }

        const mutatorName = 'set' + Str.pascalCase(attribute) + 'Attribute';
        if (!(methods && methods[mutatorName])) {
            const action = new CodeAction('Add mutator', vscode.CodeActionKind.Refactor);
            action.document = document;
            action.attribute = attribute;
            action.methodName = mutatorName;
            action.methodType = 'mutator';

            actions.push(action);
        }

        const getterName = 'get' + Str.pascalCase(attribute);
        if (!(methods && methods[getterName])) {
            const action = new CodeAction('Add getter', vscode.CodeActionKind.Refactor);
            action.document = document;
            action.attribute = attribute;
            action.methodName = getterName;
            action.methodType = 'getter';

            actions.push(action);
        }

        const setterName = 'set' + Str.pascalCase(attribute);
        if (!(methods && methods[setterName])) {
            const action = new CodeAction('Add setter', vscode.CodeActionKind.Refactor);
            action.document = document;
            action.attribute = attribute;
            action.methodName = setterName;
            action.methodType = 'setter';

            actions.push(action);
        }

        return actions;
    }

    resolveCodeAction?(codeAction: CodeAction): vscode.ProviderResult<vscode.CodeAction> {
        codeAction.command = {
            command: COMMAND_ADD_ATTRIBUTE_METHOD,
            title: `Add ${codeAction.methodType}`,
            tooltip: `Add ${codeAction.methodName} method to model`,
            arguments: [
                codeAction.document,
                codeAction.attribute,
                codeAction.methodName,
                codeAction.methodType
            ]
        };

        return codeAction;
    }
}

class CodeAction extends vscode.CodeAction {
    document?: vscode.TextDocument;
    attribute?: string;
    methodName?: string;
    methodType?: 'accessor' | 'mutator' | 'getter' | 'setter';
}

function addAttributeMethod(
    document:vscode.TextDocument,
    attribute: string,
    methodName: string,
    methodType?: 'accessor' | 'mutator' | 'getter' | 'setter'
) {
    let snippet: vscode.SnippetString;

    switch (methodType) {
        case 'accessor':
            snippet = new vscode.SnippetString(`
    public function ${methodName}(\\\$value)
    {
        return \${0:\\\$value};
    }
`);
            break;
        case 'mutator':
            snippet = new vscode.SnippetString(`
    public function ${methodName}(\\\$value)
    {
        \\\$this->attributes['${attribute}'] = \${0:\\\$value};
    }
`);
            break;
        case 'getter':
            snippet = new vscode.SnippetString(`
    public function \${1:${methodName}}()
    {
        return \${0:\\\$this->attributes['${attribute}']};
    }
`);
            break;
        case 'setter':
            snippet = new vscode.SnippetString(`
    public function \${1:${methodName}}(\$2\${0:\\\$value})
    {
        \\\$this->attributes['${attribute}'] = \${0:\\\$value};
    }
`);
            break;
    }

    const line = PhpHelpers.getClass(document.getText(), document.fileName)!.loc!.end.line - 1;

    vscode.window.showTextDocument(document.uri).then(editor => {
        editor.insertSnippet(snippet, new vscode.Position(line, 0));
    });
}
