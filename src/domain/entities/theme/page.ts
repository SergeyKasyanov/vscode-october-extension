import * as ini from 'ini';
import { Layout } from "./layout";
import { MarkupFile } from "./theme-file";

/**
 * Represents page of theme in project
 */
export class Page extends MarkupFile {
    /**
     * Theme directory containing pages
     */
    static getBaseDirectories(): string[] {
        return ['pages'];
    }

    /**
     * Layout of this page
     */
    get layout(): Layout | undefined {
        if (!this.sections.ini) {
            return;
        }

        const config = ini.parse(this.sections.ini.text);
        if (!config.layout) {
            return;
        }

        return this.owner.layouts.find(l => l.name === config.layout);
    }
}
