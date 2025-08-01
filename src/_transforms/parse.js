import { parseHTML } from "linkedom";

export default (value, outputPath) => {
    if (outputPath && outputPath.includes(".html")) {
        const { document } = parseHTML(value);

        const pageNavHeadings = document.querySelectorAll("main:has(nav) article h2");
        if (pageNavHeadings.length > 0) {
            const navContainer = document.querySelector("main nav #toc ol");
            for (const heading of pageNavHeadings) {
                if (heading.parentNode.tagName !== "NAV") {
                    const link = document.createElement("a");
                    link.setAttribute("href", `#${heading.id}`);
                    link.innerHTML = heading.innerText;
                    const li = document.createElement("li");
                    li.appendChild(link);
                    navContainer.appendChild(li);
                }
            }
        }

        return "<!DOCTYPE html>\r\n" + document.documentElement?.outerHTML;
    }

    return value;
};
