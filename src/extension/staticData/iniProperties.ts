interface IniProperty {
    title: string,
    description: string
}

interface PropertiesList {
    [name: string]: IniProperty
}

const layout: PropertiesList = {
    description: {
        title: 'Layout description',
        description: 'Optional parameter. Used in the back-end user interface.'
    }
};

const partial: PropertiesList = {
    description: {
        title: 'Partial description',
        description: 'Optional parameter. Used in the back-end user interface.'
    }
};

const page: PropertiesList = {
    title: {
        title: 'Page Title',
        description: 'Required parameter.'
    },

    url: {
        title: 'Page URL',
        description: `[URL syntax documentation](https://docs.octobercms.com/3.x/cms/themes/pages.html#url-syntax)`
    },

    layout: {
        title: 'Page layout',
        description: 'Optional parameter. If specified, should contain the name of the layout file, without extension, for example: `default`.'
    },

    description: {
        title: 'Page description',
        description: 'Optional parameter. Used in the back-end user interface.'
    },

    isHidden: {
        title: 'Hide page',
        description: 'Optional parameter. Hidden pages are accessible only by logged-in back-end users.'
    },

    metaTitle: {
        title: 'Meta Title',
        description: 'An alternative `title` field, usually more descriptive for SEO purposes.'
    },

    metaDescription: {
        title: 'Meta Description',
        description: 'An alternative `description` field, usually more descriptive for SEO purposes.'
    }
};

export {
    IniProperty,
    layout,
    partial,
    page
};
