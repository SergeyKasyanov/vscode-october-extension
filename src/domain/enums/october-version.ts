/**
 * Supported version of OctoberCMS
 */
export enum Version {
    oc10,
    oc11,
    oc20,
    oc21,
    oc22,
    oc30,
    oc31,
    oc32,
    oc33,
    oc34,
    oc35,
    oc36,
    oc37,
    oc40,
    oc41,
};

/**
 * Human readable version names
 */
export const versionNames = {
    [Version.oc10]: 'v1.0',
    [Version.oc11]: 'v1.1',
    [Version.oc20]: 'v2.0',
    [Version.oc21]: 'v2.1',
    [Version.oc22]: 'v2.2',
    [Version.oc30]: 'v3.0',
    [Version.oc31]: 'v3.1',
    [Version.oc32]: 'v3.2',
    [Version.oc33]: 'v3.3',
    [Version.oc34]: 'v3.4',
    [Version.oc35]: 'v3.5',
    [Version.oc36]: 'v3.6',
    [Version.oc37]: 'v3.7',
    [Version.oc40]: 'v4.0',
    [Version.oc41]: 'v4.1',
};
