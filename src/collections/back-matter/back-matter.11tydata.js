import slugify from "@sindresorhus/slugify";

export default {
    layout: "layouts/back-matter.njk",
    eleventyComputed: {
        permalink: (data) => `/chapters/${slugify(data.title)}/`,
        eleventyNavigation: (data) => {
            if (!data.nav) {
                return false;
            }

            return {
                key: data.uuid,
                title: data.title,
                order: data.order,
                lang: data.lang
            };
        }
    }
};
