enum OctoberVersion {
    oc10,
    oc11,
    oc20,
    oc21,
    oc22,
    oc30,
    oc31,
};

const versionNames = {
    [OctoberVersion.oc10]: 'v1.0',
    [OctoberVersion.oc11]: 'v1.1',
    [OctoberVersion.oc20]: 'v2.0',
    [OctoberVersion.oc21]: 'v2.1',
    [OctoberVersion.oc22]: 'v2.2',
    [OctoberVersion.oc30]: 'v3.0',
    [OctoberVersion.oc31]: 'v3.1',
};

export {
    OctoberVersion as Version,
    versionNames
};
