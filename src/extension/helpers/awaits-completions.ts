const SEARCH_START = 500;

/**
 * Check if offset is right after "what" and "spacer"
 * Returns index of last match or false
 *
 * @param content
 * @param offset
 * @param after
 * @param spacer
 * @returns
 */
export function awaitsCompletions(
    content: string,
    offset: number,
    after: RegExp | RegExp[],
    spacer: RegExp
): number | false {
    if (!Array.isArray(after)) {
        after = [after];
    }

    const searchFrom = offset > SEARCH_START ? offset - SEARCH_START : 0;
    const docSlice = content.substring(searchFrom, offset);

    for (const what of after) {
        const matches = [...docSlice.matchAll(what)];
        if (matches.length === 0) {
            continue;
        }

        const lastMatch = matches[matches.length - 1];
        const lastMatchEnd = lastMatch.index! + lastMatch[0].length;
        const forSpacer = docSlice.substring(lastMatchEnd);

        if (spacer.test(forSpacer)) {
            return lastMatch.index! + searchFrom;
        }
    }

    return false;
}
