import { MarkdownString } from "vscode";

export interface TwigFilter {
    name: string,
    snippet: string,
    doc?: string | MarkdownString,
}
