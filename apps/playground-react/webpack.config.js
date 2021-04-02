/**
 * Reusable Webpack config elements
 * Initial goal: avoid config duplication between the main webpack config and the storybook webpack config
 */
const helpers = require('./helpers');

const tailwindJit = require('@tailwindcss/jit/src/index.js');
const autoprefixer = require('autoprefixer');
const nrwlConfig = require('@nrwl/react/plugins/webpack.js'); // require the main @nrwl/react/plugins/webpack configuration function.

/**
 * Plugins
 */
const postCssPlugins = [
  /**
   * Tailwind
   */
  tailwindJit(helpers.root('playground-react/tailwind.config.js')), // We use the helper to ensure that the path is always relative to the workspace root,

  // PostCSS plugin to parse CSS and add vendor prefixes to CSS rules using values from Can I Use.
  // Write your CSS rules without vendor prefixes (in fact, forget about them entirely). Autoprefixer will use the data based on current browser popularity and property support to apply prefixes for you.
  autoprefixer,
];

/**
 * Tailwind config
 */
const tailwindWebpackRule = {
  test: /\.scss$/,
  loader: 'postcss-loader',
  options: {
    // reference: https://github.com/webpack-contrib/postcss-loader
    postcssOptions: {
      ident: 'postcss',
      syntax: 'postcss-scss',
      plugins: postCssPlugins,
    },
  },
};

module.exports = (config, context) => {
  nrwlConfig(config); // first call it so that it @nrwl/react plugin adds its configs,

  config.module.rules.push(tailwindWebpackRule);
  return config;
};
