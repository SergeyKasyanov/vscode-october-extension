import * as vscode from 'vscode';

export interface Permission {
    code: string,
    label?: string,
    comment?: string
}

export class Navigation {
    [mainMenu: string]: string[]
}

export interface EnvVariable {
    key: string,
    value: string | undefined | null,
    location: vscode.Location
};

export interface Event {
    name: string,
    filePath: string,
    offset: number
};
