import * as vscode from "vscode";
import { splitFrontendFile } from "../../../helpers/splitFrontendFile";

export class DocumentSectionFoldingProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(
        document: vscode.TextDocument,
        context: vscode.FoldingContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FoldingRange[]> {

        const sections = splitFrontendFile(document.getText());

        if (sections.length < 2) {
            return [];
        }

        let ranges = [];
        let prevStart = 0;
        let line = 0;

        while (line < document.lineCount) {
            if (document.lineAt(line).text === '==') {
                ranges.push(
                    new vscode.FoldingRange(prevStart, line, vscode.FoldingRangeKind.Region)
                );
                prevStart = line + 1;
            }

            if (ranges.length === 3) {
                break;
            }

            line++;
        }

        if (ranges.length < 3) {
            ranges.push(new vscode.FoldingRange(prevStart, document.lineCount - 1, vscode.FoldingRangeKind.Region));
        }

        return ranges;
    }
}
