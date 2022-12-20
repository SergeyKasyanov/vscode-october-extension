import * as vscode from "vscode";
import { MarkupFile } from "../../../../domain/entities/theme/theme-file";
import { Store } from "../../../../domain/services/store";
import { awaitsCompletions } from "../../../helpers/awaits-completions";

const CONFIG_GET_FUNC = /(config|Config::get)\s*\(\s*\[{0,1}\s*([\'\"][\w\-\_\.\:]*[\'\"]\s*,\s*)*[\'\"]/g;
const CONFIG_SET_FUNC = /((Config::set\s*\(\s*)|(config\s*\(\s*\[\s*(['\"][\w\-\_\.\:]*[\'\"]\s*=>\s*.*,\s*)*))[\'\"]/g;
const CONFIG_KEY_PART = /^[\w\-\_\.\:]*$/;
const CONFIG_KEY = /[\w\-\_\.\:]+/;

/**
 * Completions for config keys in php code.
 *
 * config('...')
 * config(['...'])
 * Config::get('...')
 * Config::set('...')
 * Config::get(['...'])
 */
export class ConfigKey implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const entity = Store.instance.findEntity(document.fileName);

        const project = entity?.owner.project || Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const isPhp = document.fileName.endsWith('.php')
            || (entity instanceof MarkupFile && entity.isOffsetInsidePhp(document.offsetAt(position)));

        if (!isPhp) {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            [CONFIG_GET_FUNC, CONFIG_SET_FUNC],
            CONFIG_KEY_PART
        )) {
            return;
        }

        return project.config.map(key => {
            const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.EnumMember);
            item.range = document.getWordRangeAtPosition(position, CONFIG_KEY);

            return item;
        });
    }
}
