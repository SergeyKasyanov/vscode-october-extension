import * as phpParser from "php-parser";
import * as vscode from "vscode";
import { getPropertiesFromDockBlock, parsePhp } from "../../../../helpers/parsePhp";
import { PluginFileUtils } from "../../../../helpers/pluginFileUtils";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class PhpModelPropertiesAttributesCompletionItemProvider implements vscode.CompletionItemProvider {

    private document?: vscode.TextDocument;
    private position?: vscode.Position;
    private pluginCode?: string;
    private modelName?: string;
    private attributes: string[] = [];

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (!parsed || parsed.directory !== 'models') {
            return;
        }

        this.document = document;
        this.position = position;
        this.pluginCode = parsed.pluginCode;
        this.modelName = parsed.classNameWithoutExt;

        if (isRightAfter(document, position, regExps.phpModelListAttributeGlobal, regExps.phpModelAttributesList)
            || isRightAfter(document, position, regExps.phpModelAssociativeAttributesGlobal, regExps.phpModelAttributesArrayKeys)
        ) {
            this.loadAttributes();
            return this.buildCompletions();
        }

        if (isRightAfter(document, position, regExps.phpModelCustomMessagesAttributeGlobal, regExps.phpModelCustomMessagesAttributesArrayKeys)) {
            return this.buildCustomMessagesCompletions();
        }

        return;
    }

    private loadAttributes() {
        let attributes: string[] = [];

        const model = Project.instance.getModel(this.pluginCode!, this.modelName!);
        if (model) {
            attributes = Object.keys(model.columns);
        }

        const ast = parsePhp(this.document!.getText(), this.document!.fileName);
        const ns = ast.children.find(el => el.kind === 'namespace') as phpParser.Namespace;
        if (!ns) {
            return;
        }

        const modelClass = ns.children.find(el => el.kind === 'class') as phpParser.Class;
        if (!modelClass) {
            return;
        }

        if (!modelClass.leadingComments || modelClass.leadingComments.length === 0) {
            return;
        }

        modelClass.leadingComments.forEach(comment => {
            const properties = getPropertiesFromDockBlock(comment);
            attributes.push(...properties);
        });

        this.attributes = [...new Set(attributes)].sort();
    }

    private buildCompletions(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        return this.attributes.map(
            attr => new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property)
        );
    }

    private buildCustomMessagesCompletions(): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const ast = parsePhp(this.document!.getText(), this.document!.fileName);
        const ns = ast.children.find(el => el.kind === 'namespace') as phpParser.Namespace;
        if (!ns) {
            return;
        }

        const modelClass = ns.children.find(el => el.kind === 'class') as phpParser.Class;
        if (!modelClass) {
            return;
        }

        let rulesProperty: phpParser.Property | undefined;

        for (const el in modelClass.body) {
            if (Object.prototype.hasOwnProperty.call(modelClass.body, el)) {
                const propStmt = (modelClass.body[el] as unknown as phpParser.PropertyStatement);
                if (propStmt.kind !== 'propertystatement') {
                    continue;
                }

                for (const p in propStmt.properties) {
                    if (Object.prototype.hasOwnProperty.call(propStmt.properties, p)) {
                        const property = propStmt.properties[p] as phpParser.Property;
                        const propIdentifier = (property.name as phpParser.Identifier | string);
                        const propName = propIdentifier instanceof Object ? propIdentifier.name : propIdentifier;
                        if (propName === 'rules') {
                            rulesProperty = property;
                            break;
                        }
                    }
                }
            }
        }

        if (!rulesProperty) {
            return;
        }

        let customMessagesKeys: string[] = [];

        const rulesValue = rulesProperty.value as phpParser.Array;
        rulesValue.items.forEach(entry => {
            const isFieldRulePaid = entry.kind === 'entry'
                && (entry as phpParser.Entry).key?.kind === 'string'
                && (entry as phpParser.Entry).value?.kind === 'string';

            if (!isFieldRulePaid) {
                return;
            }

            const fieldName = ((entry as phpParser.Entry).key as phpParser.String).value;

            ((entry as phpParser.Entry).value as phpParser.String).value
                .split('|')
                .forEach(ruleStmt => {
                    const rule = ruleStmt.split(':')[0];
                    if (rule) {
                        customMessagesKeys.push(fieldName + '.' + rule);
                    }
                });
        });

        return customMessagesKeys.map(attr => {
            const item = new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property);
            item.range = this.document!.getWordRangeAtPosition(this.position!, regExps.phpModelCustomMessagesAttributeKey);

            return item;
        });
    }
}
