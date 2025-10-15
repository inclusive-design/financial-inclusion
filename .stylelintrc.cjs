module.exports = {
  extends: ["stylelint-config-fluid"],
  ignoreFiles: ["_site/**/*.css"],
  rules: {
    "custom-property-pattern": null,
    "selector-class-pattern": null,
    "max-line-length": null,
    "selector-pseudo-class-no-unknown": [
      true,
      { "ignorePseudoClasses": ["first-of-group"] }
    ],
    "property-no-unknown": [true, { "ignoreProperties": ["page-group", "string-set"] }],
    "function-no-unknown": [true, {
      ignoreFunctions: ["string", "content"]
    }]
  }
};
