import { IdAttributePlugin, RenderPlugin } from "@11ty/eleventy";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import fontAwesomePlugin from "@11ty/font-awesome";
import fluidPlugin from "eleventy-plugin-fluid";
import { __ } from "eleventy-plugin-fluid";
import footnotesPlugin from "eleventy-plugin-footnotes";
import _ from "lodash";
import parse from "./src/_transforms/parse.js";
import { consolePlus } from 'eleventy-plugin-console-plus';
import Image from "@11ty/eleventy-img";
import { parseHTML } from "linkedom";
import { encode } from 'node-base64-image';

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

<<<<<<< Updated upstream
  eleventyConfig.addNunjucksAsyncShortcode("includeSvg", async (filename, altText = '', className = null) => {
    const metadata = await Image(`./src/_includes/svg/${filename}`, {
=======
  eleventyConfig.addNunjucksAsyncShortcode("includeSvg", async function (fileSlug, altText = '', className = null, displayPrint = true) {
    if (fileSlug.includes('.svg')) {
      fileSlug = fileSlug.split('.svg')[0];
    }

    const primaryImage = await Image(`./src/assets/images/${fileSlug}.svg`, {
>>>>>>> Stashed changes
      formats: ["svg"],
      dryRun: true,
    })
    const { document } = parseHTML(metadata.svg[0].buffer.toString());
    const svg = document.querySelector('svg');
    svg.setAttribute('role', altText !== '' ? 'img' : 'presentation')
    svg.setAttribute('aria-label', altText);
    if (className) {
<<<<<<< Updated upstream
      svg.setAttribute('class', className);
    }
    return svg.toString();
=======
      if (displayPrint) {
        svg.setAttribute('class', `web ${className}`);
      } else {
        svg.setAttribute('class', className);
      }
    } else {
      if (displayPrint) {

        svg.setAttribute('class', 'web');
      }
    }

    let printSlug = fileSlug;

    if (existsSync(`./src/assets/images/${fileSlug}-print.svg`)) {
      printSlug = `${fileSlug}-print`;
    }

    const printImg = `<img src="/assets/images/${printSlug}.svg" width="${primaryImage.svg[0].width}" height="${primaryImage.svg[0].height}" alt="${altText}" class="${className ? `print ${className}` : 'print'}" />`;

    let mobileSvg = null;

    if (existsSync(`./src/assets/images/${fileSlug}-mobile.svg`)) {
      const mobileImage = await Image(`./src/assets/images/${fileSlug}-mobile.svg`, {
        formats: ["svg"],
        dryRun: true
      });

      const { document } = parseHTML(mobileImage.svg[0].buffer.toString());
      mobileSvg = document.querySelector('svg');
      if (altText !== '') {
        mobileSvg.setAttribute('role', 'img');
        mobileSvg.setAttribute('aria-label', altText);
      } else {
        mobileSvg.setAttribute('role', 'presentation');
      }

      if (className) {
        mobileSvg.setAttribute('class', `web mobile ${className}`);
      } else {
        mobileSvg.setAttribute('class', 'web mobile');
      }
    }

    return `${displayPrint ? printImg : ''}${svg.toString()}${mobileSvg ? mobileSvg.toString() : ''}`;
>>>>>>> Stashed changes
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

  return {
    dir: {
      input: "src"
    },
    templateFormats: ["njk", "md", "css", "png", "jpg", "svg"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
