export interface Permission {
    code: string,
    label?: string,
    comment?: string
}

export class Navigation {
    [mainMenu: string]: string[]
}
