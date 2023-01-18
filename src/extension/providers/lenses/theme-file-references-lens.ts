import * as vscode from 'vscode';
import { ThemeFile } from '../../../domain/entities/theme/theme-file';
import { Store } from '../../../domain/services/store';

/**
 * Code lens for showing references to this theme file
 */
export class ThemeFileReferencesLens implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<CodeLens[]> {
        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof ThemeFile)) {
            return;
        }

        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(0, 0);
        const range = new vscode.Range(start, end);

        const lens = new CodeLens(range);
        lens.document = document;
        lens.themeFile = themeFile;
        lens.uri = document.uri;

        return [lens];
    }

    async resolveCodeLens?(codeLens: CodeLens): Promise<CodeLens> {
        const references = await codeLens.themeFile!.findReferences();

        codeLens.command = {
            title: `${references.length} references`,
            tooltip: 'Find all references',
            arguments: [
                codeLens.uri,
                codeLens.range.start,
                references
            ],
            command: 'editor.action.showReferences'
        };

        return codeLens;
    }
}

class CodeLens extends vscode.CodeLens {
    themeFile?: ThemeFile;
    uri?: vscode.Uri;
    document?: vscode.TextDocument;
}
