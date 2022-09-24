import { Content } from "./content";
import { Layout } from "./layout";
import { Page } from "./page";
import { Partial } from "./partial";

export class Theme {
    private _layouts: { [name: string]: Layout } = {};
    private _pages: { [name: string]: Page } = {};
    private _partials: { [name: string]: Partial } = {};
    private _contents: { [name: string]: Content } = {};

    constructor(
        private _name: string
    ) { }

    public get name(): string {
        return this._name;
    }

    //
    // Layouts
    //

    public get layouts() {
        return this._layouts;
    }

    public getLayoutNames(): string[] {
        return Object.keys(this._layouts);
    }

    public getLayout(name: string): Layout | undefined {
        return this._layouts[name];
    }

    public addLayouts(layouts: Layout[]): void {
        for (const l of layouts) {
            this._layouts[l.name] = l;
        }
    }

    public removeLayout(name: string): void {
        delete this._layouts[name];
    }

    //
    // Pages
    //

    public get pages() {
        return this._pages;
    }

    public getPageNames(): string[] {
        return Object.keys(this._pages);
    }

    public getPage(name: string): Page | undefined {
        return this._pages[name];
    }

    public addPages(pages: Page[]): void {
        for (const p of pages) {
            this._pages[p.name] = p;
        }
    }

    public removePage(name: string): void {
        delete this._pages[name];
    }

    //
    // Partials
    //

    public get partials() {
        return this._partials;
    }

    public getPartial(name: string): Partial | undefined {
        return this._partials[name];
    }

    public getPartialsNames(): string[] {
        return Object.keys(this._partials);
    }

    public addPartials(partials: Partial[]): void {
        for (const p of partials) {
            this._partials[p.name] = p;
        }
    }

    public removePartial(name: string): void {
        delete this._partials[name];
    }

    //
    // Contents
    //

    public get contents() {
        return this._contents;
    }

    public getContent(name: string): Content | undefined {
        return this._contents[name];
    }

    public getContentsNames(): string[] {
        return Object.keys(this._contents);
    }

    public addContents(contents: Content[]): void {
        for (const c of contents) {
            this._contents[c.name] = c;
        }
    }

    public removeContent(name: string): void {
        delete this._contents[name];
    }
}
