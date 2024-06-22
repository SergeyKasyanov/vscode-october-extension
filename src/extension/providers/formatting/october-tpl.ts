import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import { formatIni } from "./formats/format-ini";
import { formatPhp } from "./formats/format-php";
import { formatTwig } from "./formats/format-twig";

/**
 * Provides document formatting support for OctoberCMS theme templates
 */
export class OctoberTplDocumentFormatting implements vscode.DocumentFormattingEditProvider {

    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions
    ): Promise<vscode.TextEdit[]> {

        const eol = (document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');

        let result: string = '';

        const entity = Store.instance.findEntity(document.fileName) as MarkupFile;
        const sections = entity.sections;

        let onlyTwig = true;

        if (sections.ini?.text.length) {
            result += await formatIni(sections.ini.text.trim(), { ...options, eol });
            onlyTwig = false;
        }

        if (sections.php?.text.length) {
            result += await formatPhp(sections.php.text.trim(), { ...options, eol });
            onlyTwig = false;
        }

        if (sections.twig) {
            result += await formatTwig(sections.twig, document, { ...options, eol, onlyTwig });
        }

        return new Promise(resolve => {
            resolve([
                new vscode.TextEdit(
                    new vscode.Range(
                        new vscode.Position(0, 0),
                        new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1).text.length)
                    ),
                    result
                )
            ]);
        });
    }
}
