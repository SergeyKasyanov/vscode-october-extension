import * as vscode from 'vscode';
import { MarkupFile } from '../../../../domain/entities/theme/theme-file';
import { Store } from '../../../../domain/services/store';
import { awaitsCompletions } from '../../../helpers/completions';

const CONNECTION_METHOD = /(DB|Schema)::connection\s*\(\s*[\'\"]/g;
const LOG_CHANNEL_METHOD = /Log::channel\s*\(\s*[\'\"]/g;
const QUEUE_METHOD = /Queue::(connection|connected|pushOn)\s*\(\s*[\'\"]/g;
const STORAGE_DISK_METHOD = /Storage::disk\s*\(\s*[\'\"]/g;
const MAIL_MAILER_METHOD = /Mail::mailer\s*\(\s*[\'\"]/g;

const NAME_PART = /^[\w\-\_\/]*$/;
const NAME = /[\w\-\_\/]+/;

const SETS: { [key: string]: RegExp } = {
    'database.connections.': CONNECTION_METHOD,
    'queue.connections.': QUEUE_METHOD,
    'logging.channels.': LOG_CHANNEL_METHOD,
    'filesystems.disks.': STORAGE_DISK_METHOD,
    'mail.mailers.': MAIL_MAILER_METHOD,
};

/**
 * Completions for:
 * - DB::connection('...') or Schema::connection('...')
 * - Log::channel('...')
 * - Queue::connection('...'), Queue::connected('...'), Queue::pushOn('...'),
 * - Storage::disk('...')
 * - Mail::mailer('...')
 */
export class ConfigEnum implements vscode.CompletionItemProvider {

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {

        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        if (!this.checkDocumentType(document, position)) {
            return;
        }

        for (const configKey in SETS) {
            if (Object.prototype.hasOwnProperty.call(SETS, configKey)) {
                const regExp = SETS[configKey];

                if (awaitsCompletions(
                    document.getText(),
                    document.offsetAt(position),
                    regExp,
                    NAME_PART
                )) {
                    return project.config
                        .filter((key) => key.startsWith(configKey))
                        .reduce((acc: string[], key) => {
                            const conn = key.split('.')[2];

                            if (conn && !acc.includes(conn)) {
                                acc.push(conn);
                            }

                            return acc;
                        }, [])
                        .map(key => {
                            const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.EnumMember);
                            item.range = document.getWordRangeAtPosition(position, NAME);

                            return item;
                        });
                }
            }
        }

    }

    private checkDocumentType(document: vscode.TextDocument, position: vscode.Position) {
        const entity = Store.instance.findEntity(document.fileName);
        if (entity instanceof MarkupFile) {
            return entity.isOffsetInsidePhp(document.offsetAt(position));
        }

        return document.languageId === 'php';
    }

}
