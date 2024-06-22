import * as vscode from 'vscode';

export class OctoberTplRangeFormatting implements vscode.DocumentRangeFormattingEditProvider {
    provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range,
        options: vscode.FormattingOptions): vscode.ProviderResult<vscode.TextEdit[]> {
        throw new Error('Method not implemented.');
    }

    provideDocumentRangesFormattingEdits?(
        document: vscode.TextDocument,
        ranges: vscode.Range[],
        options: vscode.FormattingOptions
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        throw new Error('Method not implemented.');
    }
}
