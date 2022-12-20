import { ThemeFile } from "./theme-file";

const ECHO_VAR = /\{\w+\}/g;

/**
 * Represents content of theme in project
 */
export class Content extends ThemeFile {
    /**
     * Theme directory containing contents
     */
    static getBaseDirectories(): string[] {
        return ['content'];
    }

    /**
     * Variables used in content block
     */
    get usedVars(): string[] {
        const fileContent = this.fileContent;
        if (!fileContent) {
            return [];
        }

        const variables: string[] = [];

        const varsMatches = fileContent.matchAll(ECHO_VAR);

        for (const variable of varsMatches) {
            const varName = variable[0].slice(1, -1);
            if (!variables.includes(varName)) {
                variables.push(varName);
            }
        }

        return variables;
    }
}
