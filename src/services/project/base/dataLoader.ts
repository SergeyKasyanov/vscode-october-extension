import * as vscode from 'vscode';

export abstract class DataLoader {

    protected _data: any = {};

    public get data(): any {
        return this._data;
    }

    public refreshData() {
        this.loadData();
    }

    protected constructor() {
        this.loadData();
        this.startWatcher();
    }

    protected startWatcher() {
        let self = this;
        let timer: NodeJS.Timeout;
        let pattern = this.getWatcherPathPattern();

        if (pattern) {
            let watcher = vscode.workspace.createFileSystemWatcher(pattern);

            watcher.onDidChange((e: vscode.Uri) => {
                console.debug('File changed: ' + e.path);
                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(function () {
                    self.loadData();
                    clearTimeout(timer);
                }, 5000);
            });

            watcher.onDidDelete((e: vscode.Uri) => {
                console.debug('File deleted: ' + e.path);
                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(function () {
                    self.loadData();
                    clearTimeout(timer);
                }, 5000);
            });
        }
    }

    protected abstract loadData(): any;

    protected abstract getWatcherPathPattern(): vscode.GlobPattern | undefined;
}
