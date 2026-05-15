const yaml = require("js-yaml");

module.exports = function(eleventyConfig) {
  // support .yml / .yaml data files
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  // copy images directly to output
  eleventyConfig.addPassthroughCopy({ "images": "images" });
  eleventyConfig.addPassthroughCopy("admin");

  // markdown options
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: false,
  });

  // add a `jsonStringify` filter for embedding data in HTML
  eleventyConfig.addFilter("jsonStringify", (value) => JSON.stringify(value));

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
