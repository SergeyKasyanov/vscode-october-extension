import * as vscode from "vscode";
import { Store } from "../../../domain/services/store";
import { resolveBackendController } from "../../helpers/resolve-backend-controller";
import { DocumentLink } from "../../types/document-link";
import { YamlHelpers } from "../../helpers/yaml-helpers";

const RECORD_URL_KEY = /(recordUrl)\:\s+[\w\-\_\/:]+/g;

export class RecordUrl implements vscode.DocumentLinkProvider {
    provideDocumentLinks(
        document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: vscode.DocumentLink[] = [];

        const matches = document.getText().matchAll(RECORD_URL_KEY);
        for (const match of matches) {
            const line = document.positionAt(match.index!).line;
            const url = YamlHelpers.getKeyAndValue(document.lineAt(line).text).value;
            if (!url) {
                continue;
            }

            const valueOffset = match[0].indexOf(url);

            const start = document.positionAt(match.index! + valueOffset);
            const end = start.translate(0, url.length);
            const range = new vscode.Range(start, end);

            links.push(new DocumentLink(document, range));
        }

        return links;
    }

    resolveDocumentLink?(link: DocumentLink, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink> {
        const project = Store.instance.findProject(link.document!.fileName);
        if (!project) {
            return;
        }

        const resolved = resolveBackendController(project, link.markedText);
        if (!resolved?.controller) {
            vscode.window.showErrorMessage('Unknown controller');
            return;
        }

        const { controller, range } = resolved;

        link.target = vscode.Uri.file(controller.path);

        if (range) {
            const fragment = 'L' + range.start.line + ',' + range.start.character;
            link.target = link.target.with({ fragment });
        } else {
            link.target = link.target.with({ fragment: controller.classPositionForLinks });
        }

        return link;
    }

}
