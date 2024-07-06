/**
 * Theme file section
 */
export type Section = {
    text: string,
    offset: number
};

/**
 * Contains theme file sections as strings
 */
export interface ThemeFileSections {
    ini?: Section,
    php?: Section,
    twig: Section
}

const SECTIONS_DIVIDER = /\r?\n==\r?\n/;
const SECTIONS_DIVIDER_LENGTH = 4; // "\n==\n"

/**
 * Split OctoberCMS markup to sections (ini, php, twig)
 */
export function splitMarkup(code: string): ThemeFileSections {
    const splitted = code.split(SECTIONS_DIVIDER);

    if (!splitted) {
        return {
            twig: {
                text: '',
                offset: 0
            }
        };
    }

    if (splitted.length === 1) {
        return {
            twig: {
                text: splitted[0],
                offset: 0
            }
        };
    } else if (splitted.length === 2) {
        return {
            ini: {
                text: splitted[0],
                offset: 0
            },
            twig: {
                text: splitted[1],
                offset: splitted[0].length + SECTIONS_DIVIDER_LENGTH
            }
        };
    }

    return {
        ini: {
            text: splitted[0],
            offset: 0
        },
        php: {
            text: splitted[1],
            offset: splitted[0].length + SECTIONS_DIVIDER_LENGTH
        },
        twig: {
            text: splitted[2],
            offset: splitted[0].length
                + SECTIONS_DIVIDER_LENGTH
                + splitted[1].length
                + SECTIONS_DIVIDER_LENGTH
        }
    };
}
