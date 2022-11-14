import { OctoberClass } from "./october-class";

export class Command extends OctoberClass {
    /**
     * Directory containing artisan commands of plugin/module
     * @returns
     */
    static getBaseDirectories(): string[] {
        return ['console'];
    }
}
