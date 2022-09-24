import { execPhpInProject } from "../../../helpers/shell";
import { DataLoader } from './dataLoader';

export abstract class PhpDataLoader extends DataLoader {

    protected async loadData() {
        console.debug(this.constructor.name + ' loading...');

        try {
            const rawData = await execPhpInProject(this.getPhpScript());
            const data = JSON.parse(rawData);
            this.processData(data);
        } catch (err) {
            console.error(err);
        }
    }

    protected abstract getPhpScript(): string;

    protected abstract processData(data: any): void;
}
