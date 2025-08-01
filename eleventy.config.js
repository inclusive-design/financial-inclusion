import { randomUUID } from "node:crypto";
import { IdAttributePlugin, RenderPlugin } from "@11ty/eleventy";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import fontAwesomePlugin from "@11ty/font-awesome";
import brokenLinksPlugin from "eleventy-plugin-broken-links";
import fluidPlugin from "eleventy-plugin-fluid";
import { __ } from "eleventy-plugin-fluid";
import footnotesPlugin from "eleventy-plugin-footnotes";
import _ from "lodash";
import parse from "./src/_transforms/parse.js";

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
    }
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

  eleventyConfig.addPlugin(brokenLinksPlugin, {
    forbidden: "warn",
    broken: "warn",
    cacheDuration: "60s",
    loggingLevel: 2,
    excludeInputs: ["**/*/*.css"]
  });

  eleventyConfig.addPlugin(IdAttributePlugin, {
    selector: 'h2'
  });

  eleventyConfig.addPreprocessor("drafts", "*", (data, _content) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  return {
    dir: {
      input: "src"
    },
    templateFormats: ["njk", "md", "css", "png", "jpg", "svg"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
