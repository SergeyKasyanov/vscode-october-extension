import { MarkupFile, ThemeFileType } from "./theme-file";

const ECHO_BASE = /\{\{\s*/;
const ECHO_STATEMENTS = /\{\{\s*\w+/g;
const IF_BASE = /if\s+/;
const IF_STATEMENTS = /if\s+\w+/g;
const FOR_BASE = /for\s+\w+[,\w+]{0,1}\s+in\s+/;
const FOR_STATEMENTS = /for\s+\w+[,\w+]{0,1}\s+in\s+\w+/g;

/**
 * Represents partial of theme in project
 */
export class Partial extends MarkupFile {
    /**
     * Theme directory containing partials
     */
    static getBaseDirectories(): string[] {
        return ['partials'];
    }

    /**
     * Entity type
     */
    get type(): ThemeFileType {
        return 'partial';
    }

    /**
     * Variables used in partial
     */
    get usedVars(): string[] {
        const fileContent = this.fileContent;
        if (!fileContent) {
            return [];
        }

        const variables: string[] = [];

        const echoedMatches = fileContent.matchAll(ECHO_STATEMENTS);
        for (const match of echoedMatches) {
            const varname = match[0].replace(ECHO_BASE, '');
            if (!variables.includes(varname)) {
                variables.push(varname);
            }
        }

        const ifMatches = fileContent.matchAll(IF_STATEMENTS);
        for (const match of ifMatches) {
            const varname = match[0].replace(IF_BASE, '');
            if (!variables.includes(varname)) {
                variables.push(varname);
            }
        }

        const forMatches = fileContent.matchAll(FOR_STATEMENTS);
        for (const match of forMatches) {
            const varname = match[0].replace(FOR_BASE, '');
            if (!variables.includes(varname)) {
                variables.push(varname);
            }
        }

        return variables;
    }

    /**
     * Snippet properties declared in this partial
     */
    get snippetProperties(): string[] {
        const snippetProperties: string[] = [];

        const components = this.components;
        for (const alias in components) {
            if (Object.prototype.hasOwnProperty.call(components, alias)) {
                const comp = components[alias];
                if (comp.fqn === 'Cms\\Components\\ViewBag') {
                    const snippetPropertiesMatches = this.sections.ini?.text.matchAll(/snippetProperties\[\w+\]/g) || [];

                    for (const match of snippetPropertiesMatches) {
                        const property = match[0].split('[')[1].slice(0, -1);

                        if (!snippetProperties.includes(property)) {
                            snippetProperties.push(property);
                        }
                    }

                    break;
                }
            }
        }

        return snippetProperties;
    }
}
