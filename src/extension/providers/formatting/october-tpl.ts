import * as vscode from "vscode";
import { Store } from "../../../domain/services/store";
import { splitMarkup } from "../../helpers/split-markup";
import { loadPrettierConfig } from "./config/load-prettier-config";
import { formatIni, IniFormattingOptions } from "./formats/format-ini";
import { formatPhp, PhpFormattingOptions } from "./formats/format-php";
import { formatTwig, TwigFormattingOptions } from "./formats/format-twig";

/**
 * Provides document formatting support for OctoberCMS theme templates
 */
export class OctoberTplDocumentFormatting implements vscode.DocumentFormattingEditProvider {

    async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions
    ): Promise<vscode.TextEdit[]> {
        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return [];
        }

        const config = await loadPrettierConfig(project!.path, options);
        const eol = (document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
        const sections = splitMarkup(document.getText());
        let onlyTwig = true;

        let result: string = '';

        if (sections.ini?.text.length) {
            result += await formatIni(
                sections.ini.text.trim(),
                config as IniFormattingOptions,
                eol
            );
            onlyTwig = false;
        }

        if (sections.php?.text.length) {
            result += await formatPhp(
                sections.php.text.trim(),
                config as PhpFormattingOptions,
                eol
            );
            onlyTwig = false;
        }

        if (sections.twig) {
            result += await formatTwig(
                sections.twig.text.trim(),
                config as TwigFormattingOptions,
                eol,
                onlyTwig
            );
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
