const yaml = require("js-yaml");
const Image = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
  const defaultImageWidths = [360, 720, 1080, 1440, 1600];
  const imageOptions = {
    widths: defaultImageWidths,
    formats: ["webp", "auto"],
    urlPath: "/img/",
    outputDir: "./_site/img/",
    sharpWebpOptions: { quality: 78 },
    sharpJpegOptions: { quality: 82, progressive: true },
    sharpPngOptions: { compressionLevel: 9 },
  };

  function imageInputPath(src) {
    if (!src) return "";
    if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
    return src.startsWith("/") ? src.slice(1) : src;
  }

  async function getImageMetadata(src) {
    return Image(imageInputPath(src), imageOptions);
  }

  function joinSrcset(entries = []) {
    return entries.map((entry) => entry.srcset).join(", ");
  }

  function getFallbackEntries(metadata) {
    const fallbackFormat = Object.keys(metadata).find((format) => format !== "webp") || Object.keys(metadata)[0];
    return metadata[fallbackFormat] || [];
  }

  async function imageData(src, sizes = "100vw") {
    const metadata = await getImageMetadata(src);
    const fallbackEntries = getFallbackEntries(metadata);
    const fallback = fallbackEntries[0];

    return {
      src: fallback ? fallback.url : src,
      srcset: joinSrcset(fallbackEntries),
      webpSrcset: joinSrcset(metadata.webp),
      sizes,
    };
  }

  // support .yml / .yaml data files
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  // copy images directly to output
  eleventyConfig.addPassthroughCopy({ "images": "images" });
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("_headers");

  // markdown options
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: false,
  });

  // add a `jsonStringify` filter for embedding data in HTML
  eleventyConfig.addFilter("jsonStringify", (value) => JSON.stringify(value));

  eleventyConfig.addNunjucksAsyncFilter("responsiveImageList", async (images, fallbackWidth = 1280, sizes = "100vw", callback) => {
    if (typeof sizes === "function") {
      callback = sizes;
      sizes = "100vw";
    }

    try {
      const items = await Promise.all((images || []).map((src) => imageData(src, sizes)));
      callback(null, items);
    } catch (error) {
      callback(error);
    }
  });

  eleventyConfig.addNunjucksAsyncShortcode(
    "responsiveImage",
    async (src, alt = "", sizes = "100vw", fallbackWidth = 1280, loading = "lazy", className = "", extraAttrs = {}) => {
      const metadata = await getImageMetadata(src);
      const attributes = {
        ...extraAttrs,
        sizes,
        alt,
        loading,
        decoding: extraAttrs.decoding || "async",
      };
      if (className || extraAttrs.class) {
        attributes.class = className || extraAttrs.class;
      }
      if (attributes.fetchpriority === "auto") {
        delete attributes.fetchpriority;
      }

      return Image.generateHTML(metadata, attributes);
    }
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
