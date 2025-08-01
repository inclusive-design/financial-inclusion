import { randomUUID } from "node:crypto";
import { IdAttributePlugin, RenderPlugin } from "@11ty/eleventy";
import Fetch from "@11ty/eleventy-fetch";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import fontAwesomePlugin from "@11ty/font-awesome";
import fluidPlugin from "eleventy-plugin-fluid";
import { __ } from "eleventy-plugin-fluid";
import footnotesPlugin from "eleventy-plugin-footnotes";
import _ from "lodash";
import parse from "./src/_transforms/parse.js";
import fs from "node:fs";

export default function eleventy(eleventyConfig) {
  eleventyConfig.addGlobalData("now", () => new Date());
  eleventyConfig.addPlugin(fontAwesomePlugin);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(RenderPlugin);
  eleventyConfig.addPlugin(footnotesPlugin);
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
    js: { enabled: false }
  });

  ["en", "fr"].forEach((lang) => {
    eleventyConfig.addCollection(`pages_${lang}`, (collection) => {
      return collection.getFilteredByGlob(`src/collections/pages/${lang}/*.md`);
    });
  });

  eleventyConfig.addFilter("find", function find(arr = [], key = "", value) {
    return arr.find((post) => _.get(post, key) === value);
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

  eleventyConfig.addTransform("parse", parse);

  eleventyConfig.addPassthroughCopy({
    "src/admin/config.yml": "admin/config.yml"
  });

  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({ "src/assets/icons": "/" });

  eleventyConfig.addPlugin(IdAttributePlugin, {
    selector: 'h2'
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

      const url = 'https://api.docraptor.com/docs';
      const html = results.find(item => item.outputPath === './_site/index.html');

      const body = JSON.stringify({
        user_credentials: "YOUR_API_KEY_HERE",
        doc: {
          test: true,
          document_type: "pdf",
          document_content: html.content,
          javascript: true
        }
      });

      let buffer = await Fetch(url, {
        duration: '0s',
        type: 'buffer',
        filenameFormat: function (_cacheKey, _hash) {
          return `guidebook-for-financial-inclusion`;
        },
        fetchOptions: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body
        }
      });

      fs.writeFile("_site/assets/guidebook-for-financial-inclusion.pdf", buffer, "binary", function () {
        console.log('Wrote PDF to /assets/guidebook-for-financial-inclusion.pdf');
      });
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
