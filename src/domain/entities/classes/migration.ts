import { OctoberClass } from "./october-class";
import path = require("path");

const SEARCH_TABLES = /Schema\s*::\s*(create|table|drop|dropIfExists)\s*\(\s*[\'\"][\w\_]+[\'\"]/g;
const TABLE_NAME = /[\'\"][\w\_]+[\'\"]/;

export class Migration extends OctoberClass {
    private _tables: string[] = [];

    /**
     * Directory containing migrations of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return [
            path.join('database', 'migrations'),
            'updates'
        ];
    }

    /**
     * List tables used in migration
     */
    get tables(): string[] {
        const content = this.fileContent;
        if (!content) {
            return this._tables;
        }

        const tables: string[] = [];

        const matches = content.matchAll(SEARCH_TABLES);
        for (const match of matches) {
            const tableNameMatch = match[0].match(TABLE_NAME);
            const tableName = tableNameMatch![0].slice(1, -1);

            tables.push(tableName);
        }

        this._tables = [...new Set(tables)].sort();

        return this._tables;
    }

    /**
     * Does migration do something with table?
     *
     * @param table
     * @returns
     */
    usesTable(table: string): boolean {
        return !!this.fileContent?.includes(table);
    }
}
