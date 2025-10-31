import { parseHTML } from "linkedom";

const getContent = (elem) => {
    let elems = [];
    while (elem.nextElementSibling && elem.nextElementSibling.tagName !== "H3" && elem.nextElementSibling.tagName !== "H4" && elem.nextElementSibling.tagName !== "H5") {
        elems.push(elem.nextElementSibling);
        elem = elem.nextElementSibling;
    }

    elems.forEach((node) => {
        node.parentNode.removeChild(node);
    });

    return elems;
};

export default (value, outputPath) => {
    if (outputPath && outputPath.includes(".html")) {
        const { document } = parseHTML(value);

        const pageNavHeadings = document.querySelectorAll("main.export h2:not([data-narrative]):not([data-toc])");
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

        const sliceSectionHeadings = document.querySelectorAll("main.export #breakdown-of-the-different-factors ~ h5, .main.export #decomposition-des-differents-facteurs");
        if (sliceSectionHeadings.length > 0) {
            for (const heading of sliceSectionHeadings) {
                let contents = getContent(heading);
                let section = document.createElement("section");
                section.className = "flow";
                section.setAttribute("aria-labelledby", heading.id);
                heading.parentNode.insertBefore(section, heading.nextElementSibling);
                section.appendChild(heading);
                contents.forEach((node) => {
                    section.appendChild(node);
                });
            }
        }

        // TODO: Fix heading levels on home page.
        if (outputPath.includes("chapters") || outputPath.includes("chapitres")) {
            const headings = document.querySelectorAll("main h3, main h4, main h5, main h6");
            for (const heading of headings) {
                if (heading.tagName === "H3") {
                    heading.setAttribute("aria-level", 2);
                }

                if (heading.tagName === "H4") {
                    heading.setAttribute("aria-level", 3);
                }

                if (heading.tagName === "H5") {
                    heading.setAttribute("aria-level", 4);
                }

                if (heading.tagName === "H6") {
                    heading.setAttribute("aria-level", 5);
                }
            }
        }

        return "<!DOCTYPE html>\r\n" + document.documentElement?.outerHTML;
    }

    return value;
};
