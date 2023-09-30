import * as phpParser from 'php-parser';
import * as vscode from 'vscode';
import { PhpHelpers } from '../../domain/helpers/php-helpers';

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

/**
 * Is offset inside php class property
 * Returns range of property statement
 */
export function insideClassProperty(
    phpClass: phpParser.Class,
    offset: number,
    property: string[]
): vscode.Range | undefined {
    for (const el of phpClass.body) {
        if (el.kind === 'propertystatement' && el.loc) {
            const propStmt = el as unknown as phpParser.PropertyStatement;

            if (!offsetInsideLocation(offset, propStmt.loc!)) {
                continue;
            }

            for (const prop of propStmt.properties) {
                const name = PhpHelpers.identifierToString(prop.name);
                if (prop.kind === 'property' && property.includes(name)) {
                    return locationToRange(prop.loc!);
                }
            }
        }
    }

    return;
}

/**
 * Is offset inside php class method
 * Returns range of method statement
 */
export function insideClassMethod(
    phpClass: phpParser.Class,
    offset: number,
    methods: string[]
): vscode.Range | undefined {
    for (const el of phpClass.body) {
        if (el.kind === 'method' && el.loc) {
            const method = el as unknown as phpParser.Method;

            if (!offsetInsideLocation(offset, method.loc!)) {
                continue;
            }

            const name = PhpHelpers.identifierToString(method.name);

            if (methods.includes(name)) {
                return locationToRange(method.loc!);
            }
        }
    }

    return;
}

/**
 * Is offset inside php class property
 * Returns range of property statement
 */
export function insideStringPropertyValue(
    document: vscode.TextDocument,
    position: vscode.Position,
    range: vscode.Range
): boolean {
    let fragment = document.getText().slice(
        document.offsetAt(range.start),
        document.offsetAt(range.end)
    );

    let offsetDelta = document.offsetAt(position) - document.offsetAt(range.start);

    if (!fragment.startsWith('<?php')) {
        fragment = '<?php ' + fragment;
        offsetDelta += 6;
    }

    const ast = PhpHelpers.getAst(fragment, 'fragment.php');
    const exprStmt = ast?.children[0];
    if (exprStmt?.kind !== 'expressionstatement') {
        return false;
    }

    const assign = (exprStmt as phpParser.ExpressionStatement).expression;
    if (assign.kind !== 'assign') {
        return false;
    }

    const strValue = (assign as phpParser.Assign).right;
    if (strValue.kind !== 'string') {
        return false;
    }

    const strLoc = strValue.loc;
    return !!strLoc
        && offsetDelta >= strLoc.start.offset
        && offsetDelta <= strLoc.end.offset;
}

/**
 * Is position inside array key
 */
export function insideAssociativeArrayEntryKey(
    document: vscode.TextDocument,
    position: vscode.Position,
    range: vscode.Range
): boolean {
    let fragment = document.getText().slice(
        document.offsetAt(range.start),
        document.offsetAt(range.end)
    );

    let offsetDelta = document.offsetAt(position) - document.offsetAt(range.start);

    if (!fragment.startsWith('<?php')) {
        fragment = '<?php ' + fragment;
        offsetDelta += 6;
    }

    const ast = PhpHelpers.getAst(fragment, 'fragment.php');
    const exprStmt = ast?.children[0];
    if (exprStmt?.kind !== 'expressionstatement') {
        return false;
    }

    const assign = (exprStmt as phpParser.ExpressionStatement).expression;
    if (assign.kind !== 'assign') {
        return false;
    }

    const array = (assign as phpParser.Assign).right;
    if (array.kind !== 'array') {
        return false;
    }

    for (const entry of (array as phpParser.Array).items) {
        if (entry.kind !== 'entry') {
            continue;
        }

        const entryKey = (entry as phpParser.Entry).key;
        const entryValue = (entry as phpParser.Entry).value;

        if (entryKey) {
            const entryLoc = entryKey.loc;
            if (entryLoc && offsetDelta >= entryLoc.start.offset && offsetDelta <= entryLoc.end.offset) {
                return true;
            }
        } else {
            const valueLoc = entryValue.loc!;
            if (offsetDelta >= valueLoc.start.offset && offsetDelta <= valueLoc.end.offset) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Is position inside array value
 */
export function insideAssociativeArrayEntryValue(
    document: vscode.TextDocument,
    position: vscode.Position,
    range: vscode.Range
): boolean {
    let fragment = document.getText().slice(
        document.offsetAt(range.start),
        document.offsetAt(range.end)
    );

    let offsetDelta = document.offsetAt(position) - document.offsetAt(range.start);

    if (!fragment.startsWith('<?php')) {
        fragment = '<?php ' + fragment;
        offsetDelta += 6;
    }

    const ast = PhpHelpers.getAst(fragment, 'fragment.php');
    const exprStmt = ast?.children[0];
    if (exprStmt?.kind !== 'expressionstatement') {
        return false;
    }

    const assign = (exprStmt as phpParser.ExpressionStatement).expression;
    if (assign.kind !== 'assign') {
        return false;
    }

    const array = (assign as phpParser.Assign).right;
    if (array.kind !== 'array') {
        return false;
    }

    for (const entry of (array as phpParser.Array).items) {
        if (entry.kind !== 'entry') {
            continue;
        }

        if (!(entry as phpParser.Entry).key) {
            continue;
        }

        const valueLoc = (entry as phpParser.Entry).value.loc!;

        if (offsetDelta >= valueLoc.start.offset && offsetDelta <= valueLoc.end.offset) {
            return true;
        }
    }

    return false;
}

function locationToRange(loc: phpParser.Location): vscode.Range {
    const start = convertPosition(loc.start);
    const end = convertPosition(loc.end);

    return new vscode.Range(start, end);
}

function convertPosition(position: phpParser.Position): vscode.Position {
    return new vscode.Position(position.line - 1, position.column);
}

function offsetInsideLocation(
    offset: number,
    location: phpParser.Location
): boolean {
    return offset >= location.start.offset && offset <= location.end.offset;
}
