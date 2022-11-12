import { MarkdownString } from "vscode";
import { Version } from "../../domain/enums/october-version";

export interface TwigTag {
    name: string,
    snippet: string,
    doc?: string | MarkdownString,
    minVersion?: Version,
}
