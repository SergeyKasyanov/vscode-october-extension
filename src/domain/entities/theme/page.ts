import * as ini from 'ini';
import { Layout } from "./layout";
import { MarkupFile, ThemeFileType } from "./theme-file";

const LAYOUT_PROPERTY = /layout\s*=\s*[\'\"]{0,1}[\w\-\_\/\.]+[\'\"]{0,1}/g;

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
     * Entity type
     */
    get type(): ThemeFileType {
        return 'page';
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

    /**
     * Layout name offset
     */
    get layoutOffset(): { start: number, end: number } | undefined {
        const iniSection = this.sections.ini;
        if (!iniSection) {
            return;
        }

        const propMatches = [...iniSection.text.matchAll(LAYOUT_PROPERTY)];
        if (propMatches.length === 0) {
            return;
        }

        const firstMatch = propMatches[0];
        const name = firstMatch[0].split(/\s*=\s*/)[1].replace(/[\'\"]/g, '').trim();

        const start = iniSection.offset + firstMatch.index! + firstMatch[0].indexOf(name);
        const end = start + name.length;

        return { start, end };
    }
}
