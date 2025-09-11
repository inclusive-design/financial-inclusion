import slugify from "@sindresorhus/slugify";

export default {
    layout: "layouts/chapter.njk",
    eleventyComputed: {
        permalink: (data) => `/chapters/${slugify(data.shortTitle ?? data.title)}/`,
        eleventyNavigation: (data) => {
            if (!data.nav) {
                return false;
            }

            return {
                key: data.uuid,
                title: data.shortTitle ?? data.title,
                order: data.order,
                parent: data.parent ?? false,
                lang: data.lang
            };
        }
    }
};
