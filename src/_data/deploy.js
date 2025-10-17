export default function () {
    return {
        local: process.env.CF_PAGES_URL ? false : true,
        url: process.env.CF_PAGES_URL || "https://financial-inclusion.pages.dev"
    };
}
