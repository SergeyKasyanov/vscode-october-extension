import { MarkdownString } from "vscode";

export interface TwigTest {
    name: string,
    snippet: string,
    doc?: string | MarkdownString,
}
