import { GlobPattern } from "vscode";
import { TwigTag } from "../../types/twig/twigTag";
import { DataLoader } from "./base/dataLoader";
import defaultTwigTags from "./twig/defaultTwigTags";

export class TwigTagsDataLoader extends DataLoader {

    private static instance: TwigTagsDataLoader;

    public static getInstance(): TwigTagsDataLoader {
        if (!this.instance) {
            this.instance = new TwigTagsDataLoader();
            this.instance.loadData();
        }

        return this.instance;
    }

    protected _data: { [theme: string]: TwigTag } = {};

    public get data(): { [theme: string]: TwigTag } {
        return this._data;
    }

    protected loadData() {
        console.debug(this.constructor.name + ' loading...');

        this._data = defaultTwigTags;
    }

    protected getWatcherPathPattern(): GlobPattern | undefined {
        return;
    }
}
