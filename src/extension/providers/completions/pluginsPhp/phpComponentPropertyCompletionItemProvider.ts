import * as vscode from "vscode";
import { PluginFileUtils } from "../../../../helpers/pluginFileUtils";
import { regExps } from "../../../../helpers/regExps";
import { Project } from "../../../../services/project";
import { CompletionItemFactory } from "../../../factories/completionItemFactory";
import { isRightAfter } from "../../../helpers/isRightAfter";

export class PhpComponentPropertyCompletionItemProvider implements vscode.CompletionItemProvider {

    private document: vscode.TextDocument | undefined;
    private position: vscode.Position | undefined;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        this.document = document;
        this.position = position;

        if (!isRightAfter(document, position, regExps.phpPropertyMethodGlobal, regExps.spacesOrEmpty)) {
            return;
        }

        const parsed = PluginFileUtils.parseFileName(document.fileName);
        if (!parsed || parsed.directory !== 'components') {
            return;
        }

        const fqn = this.getFqn();
        if (!fqn) {
            return;
        }

        const component = Project.instance.getComponentByFqn(fqn);
        if (!component) {
            return;
        }

        const props = component.data.props;

        let result = [];

        for (const p in props) {
            if (Object.prototype.hasOwnProperty.call(props, p)) {
                const prop = props[p];

                result.push(CompletionItemFactory.fromComponentProperty(prop, ''));
            }
        }

        return result;
    }

    private getFqn(): string | undefined {
        let line = 0;

        let ns, className;

        while (line < this.document!.lineCount) {
            const lineText = this.document!.lineAt(line).text.trim();

            if (!ns && lineText.startsWith('namespace')) {
                const nsMatch = lineText.match(/namespace\s+[\w\\]+/);
                if (nsMatch) {
                    ns = nsMatch[0].replace(/namespace\s+/g, '').trim();
                }
            }

            if (!className && lineText.startsWith('class')) {
                const classMatch = lineText.match(/class\s+[\w]+/);
                if (classMatch) {
                    className = classMatch[0].replace(/class\s+/g, '').trim();
                    break;
                }
            }

            line++;
        }

        if (!ns || !className) {
            return;
        }

        return '\\' + ns + '\\' + className;
    }
}
