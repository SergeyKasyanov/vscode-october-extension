import * as vscode from "vscode";
import { MarkupFile } from "../../../domain/entities/theme/theme-file";
import { Store } from "../../../domain/services/store";
import { twigTags } from "../../../domain/static/twig-tags";
import { Hover } from "../../factories/hover-factory";

const TWIG_TAG = /\{\%\s*\w+/;

/**
 * Hover for twig tags
 *
 * {% component ...
 */
export class TwigTag implements vscode.HoverProvider {

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.Hover> {

        const themeFile = Store.instance.findEntity(document.fileName);
        if (!(themeFile instanceof MarkupFile)) {
            return;
        }

        if (!themeFile.isOffsetInsideTwig(document.offsetAt(position))) {
            return;
        }

        const tagRange = document.getWordRangeAtPosition(position, TWIG_TAG);
        if (!tagRange) {
            return;
        }

        const tagWord = document.lineAt(position.line).text
            .slice(tagRange.start.character, tagRange.end.character)
            .match(/\w+/)![0];

        const tag = twigTags[tagWord];
        if (!tag) {
            return;
        }

        return Hover.fromTwigTag(tag);
    }
}
