'use strict';

module.exports = {
    init: function (appName, folder, fs, os, path) {
        const packageJson = {
            name: appName.toLowerCase(),
            version: '0.1.0',
            private: true,
            scripts: {
                "server-start": "webpack-dev-server --open",
                "generate-docs-json": "node ./node_modules/neo.mjs/buildScripts/docs/jsdocx.js",
                "build-development": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/development/webpack.config.js",
                "build-production": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/production/webpack.config.js",
                "dev-css-structure": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/development/webpack.scss.config.js --env.json_file=neo.structure.json",
                "dev-theme-dark": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/development/webpack.scss.config.js --env.json_file=theme.dark.json",
                "dev-theme-light": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/development/webpack.scss.config.js --env.json_file=theme.light.json",
                "prod-css-structure": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/production/webpack.scss.config.js --env.json_file=neo.structure.json",
                "prod-theme-dark": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/production/webpack.scss.config.js --env.json_file=theme.dark.json",
                "prod-theme-light": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/production/webpack.scss.config.js --env.json_file=theme.light.json",
                "dev-theme-dark-no-css4": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/development/webpack.scss.config.js --env.json_file=theme.dark.noCss4.json",
                "dev-theme-light-no-css4": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/development/webpack.scss.config.js --env.json_file=theme.light.noCss4.json",
                "prod-theme-dark-no-css4": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/production/webpack.scss.config.js --env.json_file=theme.dark.noCss4.json",
                "prod-theme-light-no-css4": "webpack --config ./node_modules/neo.mjs/buildScripts/webpack/production/webpack.scss.config.js --env.json_file=theme.light.noCss4.json",
                "test": "echo \"Error: no test specified\" && exit 1"
            },
            dependencies: {
                //"fibers": "^4.0.2",
                "jsdoc-x": "^4.0.3",
                'neo.mjs': '^1.0.19',
                "sass": "^1.24.0"
            }
        };

        fs.writeFileSync(
            path.join(folder, 'package.json'),
            JSON.stringify(packageJson, null, 4) + os.EOL
        );
    }
};