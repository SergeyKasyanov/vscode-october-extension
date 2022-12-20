import * as vscode from 'vscode';

export class DocumentLink extends vscode.DocumentLink {

    constructor(
        public document: vscode.TextDocument,
        range: vscode.Range,
        target?: vscode.Uri
    ) {
        super(range, target);
    }

    /**
     * Decorated text
     */
    get markedText() {
        return this.document!.getText().slice(...[
            this.document!.offsetAt(this.range.start),
            this.document!.offsetAt(this.range.end)
        ]);
    }

}
