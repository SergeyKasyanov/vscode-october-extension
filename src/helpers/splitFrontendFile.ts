export function splitFrontendFile(document: string): string[] {
    return document.split(/\r?\n==\r?\n/);
}
