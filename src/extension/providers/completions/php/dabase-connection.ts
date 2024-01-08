import * as vscode from 'vscode';
import { MarkupFile } from '../../../../domain/entities/theme/theme-file';
import { Store } from '../../../../domain/services/store';
import { awaitsCompletions } from '../../../helpers/completions';

const CONNECTION_METHOD = /(DB|Schema)::connection\s*\(\s*[\'\"]/g;
const CONNECTION_PART = /^[\w\-\_\/]*$/;
const CONNECTION = /[\w\-\_\/]+/;

/**
 * Completions for DB::connection('...') or Schema::connection('...')
 */
export class DatabaseConnection implements vscode.CompletionItemProvider {

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
            CONNECTION_METHOD,
            CONNECTION_PART
        )) {
            return;
        }

        return project.config
            .filter((key) => key.startsWith('database.connections.'))
            .reduce((acc: string[], key) => {
                const conn = key.split('.')[2];

                if (conn && !acc.includes(conn)) {
                    acc.push(conn);
                }

                return acc;
            }, [])
            .map(key => {
                const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.EnumMember);
                item.range = document.getWordRangeAtPosition(position, CONNECTION);

                return item;
            });
    }
}
