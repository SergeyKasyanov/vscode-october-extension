import { FilterWidget, FormWidget, ReportWidget, Widget } from "../../../entities/classes/widget";
import { DirectoryIndexer } from "./directory-indexer";

/**
 * Backend widgets directory reader
 */
export class WidgetsIndexer extends DirectoryIndexer<Widget> {

    protected getOctoberClassParentsFqn(): string[] {
        return ['Backend\\Classes\\WidgetBase'];
    }

    protected makeOctoberClass(path: string, fqn: string): Widget {
        return new Widget(this.owner!, path, fqn);
    }
}

/**
 * Backend form widgets directory reader
 */
export class FormWidgetsIndexer extends DirectoryIndexer<Widget> {

    protected getOctoberClassParentsFqn(): string[] {
        return ['Backend\\Classes\\FormWidgetBase'];
    }

    protected makeOctoberClass(path: string, fqn: string): Widget {
        return new FormWidget(this.owner!, path, fqn);
    }
}

/**
 * Dashboard report widgets directory reader
 */
export class ReportWidgetsIndexer extends DirectoryIndexer<Widget> {

    protected getOctoberClassParentsFqn(): string[] {
        return ['Backend\\Classes\\ReportWidgetBase'];
    }

    protected makeOctoberClass(path: string, fqn: string): Widget {
        return new ReportWidget(this.owner!, path, fqn);
    }
}

/**
 * Backend filter widgets directory reader
 */
export class FilterWidgetsIndexer extends DirectoryIndexer<Widget> {

    protected getOctoberClassParentsFqn(): string[] {
        return ['Backend\\Classes\\FilterWidgetBase'];
    }

    protected makeOctoberClass(path: string, fqn: string): Widget {
        return new FilterWidget(this.owner!, path, fqn);
    }
}
