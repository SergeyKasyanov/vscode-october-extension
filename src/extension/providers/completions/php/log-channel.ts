import * as vscode from 'vscode';
import { Store } from '../../../../domain/services/store';
import { MarkupFile } from '../../../../domain/entities/theme/theme-file';
import { awaitsCompletions } from '../../../helpers/completions';

const LOG_CHANNEL_METHOD = /Log::channel\s*\(\s*[\'\"]/g;
const LOG_CHANNEL_PART = /^[\w\-\_\/]*$/;
const LOG_CHANNEL = /[\w\-\_\/]+/;

export class LogChannel implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const entity = Store.instance.findEntity(document.fileName) as MarkupFile;
        if (entity instanceof MarkupFile) {
            if (!entity.isOffsetInsidePhp(document.offsetAt(position))) {
                return;
            }
        }

        if (document.languageId !== 'php') {
            return;
        }

        if (!awaitsCompletions(
            document.getText(),
            document.offsetAt(position),
            LOG_CHANNEL_METHOD,
            LOG_CHANNEL_PART
        )) {
            return;
        }

        return project.config
            .filter((key) => key.startsWith('logging.channels.'))
            .reduce((acc: string[], key) => {
                const conn = key.split('.')[2];

                if (conn && !acc.includes(conn)) {
                    acc.push(conn);
                }

                return acc;
            }, [])
            .map(key => {
                const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.EnumMember);
                item.range = document.getWordRangeAtPosition(position, LOG_CHANNEL);

                return item;
            });
    }
}
