import * as vscode from "vscode";
import { regExps } from "../../../helpers/regExps";
import { Project } from "../../../services/project";
import { isRightAfter } from "../../helpers/isRightAfter";
import { LineSectionChecks } from "../../helpers/lineSectionChecks";

export class MailTemplateCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const isPhp = document.fileName.endsWith('php')
            || (document.fileName.endsWith('htm') && LineSectionChecks.insidePhpSection(document, position));

        if (!isPhp) {
            return;
        }

        const check = isRightAfter(document, position, regExps.phpMailSendMethodStartGlobal, regExps.phpMailTemplateName)
            || isRightAfter(document, position, regExps.phpMailSendToMethodStartGlobal, regExps.phpMailTemplateName);

        if (!check) {
            return;
        }

        return Object.values(Project.instance.getMailTemplates()).map(tpl => {
            const item = new vscode.CompletionItem(tpl, vscode.CompletionItemKind.EnumMember);
            item.range = document.getWordRangeAtPosition(position, regExps.phpMailTemplateNameWord);
            return item;
        });
    }
}
