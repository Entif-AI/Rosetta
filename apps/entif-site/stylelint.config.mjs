export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['src/styles/editorial/**', 'dist/**'],
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    // Contextual descendants are deliberate within the documented cascade layers.
    'no-descending-specificity': null,
    // CSS spelling is checked; Prettier owns quotes, whitespace and notation.
    'alpha-value-notation': null,
    'color-function-notation': null,
    'color-hex-length': null,
    'font-family-name-quotes': null,
    'media-feature-range-notation': null,
    'selector-class-pattern': null,
    'scss/dollar-variable-pattern': null,
    'scss/operator-no-unspaced': null,
    'declaration-property-value-no-unknown': [
      true,
      {
        ignoreProperties: {
          'font-weight': ['270', '300', '570', '650', '780'],
        },
      },
    ],
    'property-no-vendor-prefix': [true, { ignoreProperties: ['user-select'] }],
    'selector-no-vendor-prefix': [
      true,
      { ignoreSelectors: ['::-webkit-details-marker'] },
    ],
  },
};
