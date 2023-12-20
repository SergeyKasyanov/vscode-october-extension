import * as vscode from 'vscode';
import { findYamlReferences } from '../../../domain/entities/concerns/find-yaml-references';
import { Store } from '../../../domain/services/store';

/**
 * Lens with references view for show where yaml config is used
 */
export class YamlReferenceLens implements vscode.CodeLensProvider {

    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
        const project = Store.instance.findProject(document.fileName);
        if (!project) {
            return;
        }

        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(0, 0);
        const range = new vscode.Range(start, end);

        const lens = new CodeLens(range);
        lens.uri = document.uri;
        lens.document = document;

        return [lens];
    }

    async resolveCodeLens?(codeLens: CodeLens): Promise<vscode.CodeLens> {
        const project = Store.instance.findProject(codeLens.document!.fileName);
        const references = project
            ? await findYamlReferences(project, codeLens.document!.fileName)
            : [];

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
    uri?: vscode.Uri;
    document?: vscode.TextDocument;
}
