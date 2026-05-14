module.exports = function(eleventyConfig) {
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
