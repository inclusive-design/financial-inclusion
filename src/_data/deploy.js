export default function () {
    return {
        url: process.env.CF_PAGES_URL || "http://localhost:8080"
    };
}
