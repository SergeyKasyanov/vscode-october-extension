import * as vscode from "vscode";
import { OctoberClass } from "../../../../domain/entities/classes/october-class";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const MAIL_SEND = /::send\s*\(\s*[\'\"]/g;
const MAIL_SEND_TO = /::sendTo\s*\(\s*.*,\s*[\'\"]/g;
const VIEW_MAKE = /View\s*::\s*make\s*\(\s*[\'\"]/g;
const VIEW_FUNC = /view\s*\(\s*[\'\"]/g;
const TEMPLATE_NAME_PART = /^[\w\_\-\.\:]*$/;
const TEMPLATE_NAME = /[\w\_\-\.\:]+/;

/**
 * Completions for mail templates names
 *
 * Mail::send('...')
 * Mail::sendTo($email, '...')
 * View::make(...)
 * view(...)
 */
export class ViewTemplate implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const offset = document.offsetAt(position);

        const entity = Store.instance.findEntity(document.fileName);

        const phpCode = entity instanceof OctoberClass
            || (entity instanceof MarkupFile && entity.isOffsetInsidePhp(offset));

        if (!phpCode) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            offset,
            [
                MAIL_SEND,
                MAIL_SEND_TO,
                VIEW_MAKE,
                VIEW_FUNC
            ],
            TEMPLATE_NAME_PART
        )) {
            return;
        }

        return entity.owner.project.views.map(tpl => {
            const item = new vscode.CompletionItem(tpl, vscode.CompletionItemKind.EnumMember);
            item.range = document.getWordRangeAtPosition(position, TEMPLATE_NAME);

            return item;
        });
    }
}
