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
};
