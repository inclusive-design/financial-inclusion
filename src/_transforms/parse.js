import { parseHTML } from "linkedom";

export default (value, outputPath) => {
    if (outputPath && outputPath.includes(".html")) {
        const { document } = parseHTML(value);

        const pageNavHeadings = document.querySelectorAll("main:has(nav) article h2");
        if (pageNavHeadings.length > 0) {
            const navContainer = document.querySelector("main nav #toc ul");
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

        const selects = document.querySelectorAll("select:not(.flc-prefsEditor-text-font)");
        if (selects.length > 0) {
            for (const select of selects) {
                const selectContainer = document.createElement("div");
                selectContainer.className = "select";
                select.parentNode.insertBefore(selectContainer, select);
                selectContainer.appendChild(select);
            }
        }

        return "<!DOCTYPE html>\r\n" + document.documentElement?.outerHTML;
    }

    return value;
};
