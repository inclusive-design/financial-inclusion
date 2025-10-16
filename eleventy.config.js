import { randomUUID } from "node:crypto";
import { IdAttributePlugin, RenderPlugin } from "@11ty/eleventy";
import Fetch from "@11ty/eleventy-fetch";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import fontAwesomePlugin from "@11ty/font-awesome";
import fluidPlugin from "eleventy-plugin-fluid";
import open from "open";
import { __ } from "eleventy-plugin-fluid";
import footnotesPlugin from "eleventy-plugin-footnotes";
import _ from "lodash";
import parse from "./src/_transforms/parse.js";
import fs from "node:fs";
import { exec } from "node:child_process";
import { consolePlus } from 'eleventy-plugin-console-plus';
import Image from "@11ty/eleventy-img";
import { parseHTML } from "linkedom";
import { encode } from 'node-base64-image';
import deploy from "./src/_data/deploy.js";


function princeVersion() {
  return new Promise((resolve) => {
    exec('prince --version', (_error, stdout, _stderr) => {
      resolve(stdout);
    });
  });
}

export default function eleventy(eleventyConfig) {
  eleventyConfig.addGlobalData("now", () => new Date());
  eleventyConfig.addPlugin(fontAwesomePlugin);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(RenderPlugin);
  eleventyConfig.addPlugin(footnotesPlugin);
  eleventyConfig.addPlugin(consolePlus);
  eleventyConfig.addPlugin(fluidPlugin, {
    defaultLanguage: "en",
    supportedLanguages: {
      en: {
        slug: "en",
        name: "English"
      },
      fr: {
        slug: "fr",
        name: "Français",
        dir: "ltr",
        uioSlug: "fr"
      }
    },
    css: { enabled: false },
    minify: { enabled: false }
  });

  ["en", "fr"].forEach((lang) => {
    eleventyConfig.addCollection(`front-matter-${lang}`, (collection) => {
      return collection.getFilteredByGlob(`src/collections/front-matter/${lang}/*.md`).sort((a, b) => a.data.order - b.data.order);
    });

    eleventyConfig.addCollection(`chapters-${lang}`, (collection) => {
      return collection.getFilteredByGlob(`src/collections/chapters/${lang}/*.md`).sort((a, b) => a.data.order - b.data.order);
    });

    eleventyConfig.addCollection(`back-matter-${lang}`, (collection) => {
      return collection.getFilteredByGlob(`src/collections/back-matter/${lang}/*.md`).sort((a, b) => a.data.order - b.data.order);
    });

    eleventyConfig.addCollection(`paginated-${lang}`, (collection) => {
      return collection.getFilteredByGlob([
        `src/collections/chapters/${lang}/*.md`,
        `src/collections/back-matter/${lang}/*.md`
      ])
        .sort((a, b) => a.data.order - b.data.order);
    });

    eleventyConfig.addCollection(`all-${lang}`, (collection) => {
      return collection.getFilteredByGlob(`src/collections/*/${lang}/*.md`).sort((a, b) => a.data.order - b.data.order);
    });
  });

  eleventyConfig.addFilter("findTranslation", function find(page, collection = [], lang, desiredLang) {
    const expectedFilePathStem = page.filePathStem.replace(lang, desiredLang);

    let translationUrl = false;

    collection.forEach((el) => {
      if (el.filePathStem === expectedFilePathStem) {
        translationUrl = el.url;
      }
    });
    return translationUrl;
  });

  eleventyConfig.addFilter("base64Image", async function (url) {
    const encodedImage = await encode(url, { string: true, local: true });
    return encodedImage;
  });

  /*
      Provide a custom duplicate of eleventy-plugin-fluid's uioInit shortcode in
      order to run it without the text-size preference.
  */
  eleventyConfig.addShortcode("uioCustomInit", (locale, direction) => {
    let options = {
      preferences: ["fluid.prefs.lineSpace", "fluid.prefs.textFont", "fluid.prefs.contrast", "fluid.prefs.enhanceInputs"],
      auxiliarySchema: {
        terms: {
          templatePrefix: "/lib/infusion/src/framework/preferences/html",
          messagePrefix: "/lib/infusion/src/framework/preferences/messages"
        }
      },
      prefsEditorLoader: {
        lazyLoad: true
      },
      locale: locale,
      direction: direction
    };

    return `<script>fluid.uiOptions.multilingual(".flc-prefsEditor-separatedPanel", ${JSON.stringify(options)});</script>`;
  });

  eleventyConfig.addNunjucksAsyncShortcode("includeSvg", async (filename, altText = '', className = null) => {
    const metadata = await Image(`./src/_includes/svg/${filename}`, {
      formats: ["svg"],
      dryRun: true,
    })
    const { document } = parseHTML(metadata.svg[0].buffer.toString());
    const svg = document.querySelector('svg');
    svg.setAttribute('role', altText !== '' ? 'img' : 'presentation')
    svg.setAttribute('aria-label', altText);
    if (className) {
      svg.setAttribute('class', className);
    }
    return svg.toString();
  })

  eleventyConfig.addTransform("parse", parse);

  eleventyConfig.addPassthroughCopy({
    "src/admin/config.yml": "admin/config.yml"
  });

  eleventyConfig.addPassthroughCopy({ "src/assets/icons": "/" });
  eleventyConfig.addPassthroughCopy("src/assets/downloads");

  eleventyConfig.addPlugin(IdAttributePlugin, {
    selector: 'h2,h3,h4,h5'
  });

  eleventyConfig.addPreprocessor("drafts", "*", (data, _content) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  eleventyConfig.on(
    "eleventy.after",
    async ({ dir, results, runMode, outputMode }) => {
      if (runMode !== 'build') {
        return;
      }

      console.log(deploy.url);

      // const prince = await princeVersion();

      // if (prince.includes('Prince 16')) {
      //   exec('prince --javascript _site/en/export/index.html -o _site/assets/guidebook-for-financial-inclusion.pdf', (_error, stdout, _stderr) => {
      //     console.log('[11ty] Writing ./_site/assets/guidebook-for-financial-inclusion.pdf from ./_site/en/export/index.html');
      //     open('_site/assets/guidebook-for-financial-inclusion.pdf');
      //   });
      // } else {
      //   const url = 'https://api.docraptor.com/docs';
      //   const pageUrl = `${deploy.url}/en/export/index.html`;

      //   const body = JSON.stringify({
      //     user_credentials: "YOUR_API_KEY_HERE",
      //     doc: {
      //       test: true,
      //       document_type: "pdf",
      //       document_url: pageUrl,
      //       pipeline: 11,
      //       prince_options: {
      //         baseurl: deploy.url
      //       }
      //     }
      //   });

      //   let buffer = await Fetch(url, {
      //     duration: '0s',
      //     type: 'buffer',
      //     filenameFormat: function (_cacheKey, _hash) {
      //       return `guidebook-for-financial-inclusion`;
      //     },
      //     fetchOptions: {
      //       method: 'POST',
      //       headers: {
      //         'Content-Type': 'application/json'
      //       },
      //       body
      //     }
      //   });

      //   fs.writeFile("_site/assets/guidebook-for-financial-inclusion.pdf", buffer, "binary", function () {
      //     console.log('[11ty] Writing ./_site/assets/guidebook-for-financial-inclusion.pdf from ./_site/en/export/index.html');
      //     // open('_site/assets/guidebook-for-financial-inclusion.pdf');
      //   });
      // }
    }
  );

  return {
    dir: {
      input: "src"
    },
    templateFormats: ["njk", "md", "css", "png", "jpg", "svg"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
