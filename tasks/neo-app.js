#!/usr/bin/env node

'use strict';

const chalk       = require('chalk'),
      commander   = require('commander'),
      cp          = require('child_process'),
      envinfo     = require('envinfo'),
      fs          = require('fs-extra'),
      inquirer    = require('inquirer'),
      os          = require('os'),
      packageJson = require('../package.json'),
      path        = require('path'),
      startDate   = new Date();

const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .option('-i, --info',                    'print environment debug info')
    .option('-n, --app-name <name>',         'name of your app in PascalCase')
    .option('-m, --mainThreadAddons <name>', '"AmCharts", "GoogleAnalytics", "HighlightJS", "LocalStorage", "MapboxGL", "Markdown", "Siesta", "Stylesheet"')
    .option('-s, --start <name>',            'start a web-server right after the build.', 'true')
    .option('-t, --themes <name>',           '"neo-theme-dark", "neo-theme-light", "all", "none"')
    .option('-w, --workspace <name>',        'name of the project root folder')
    .allowUnknownOption()
    .on('--help', () => {
        console.log('\nIn case you have any issues, please create a ticket here:');
        console.log(chalk.cyan(packageJson.bugs.url));
    })
    .parse(process.argv);

if (program.info) {
    console.log(chalk.bold('\nEnvironment Info:'));
    console.log(`\n  current version of ${packageJson.name}: ${packageJson.version}`);
    console.log(`  running from ${__dirname}`);
    return envinfo
        .run({
            System           : ['OS', 'CPU'],
            Binaries         : ['Node', 'npm', 'Yarn'],
            Browsers         : ['Chrome', 'Edge', 'Firefox', 'Safari'],
            npmPackages      : ['neo.mjs'],
            npmGlobalPackages: ['neo-app']
        }, {
            duplicates  : true,
            showNotFound: true
        })
        .then(console.log);
}

console.log(chalk.bold('Welcome to the neo.mjs app generator!'));
console.log(`current version of ${packageJson.name}: ${packageJson.version}`);

// npm binary based on OS
const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

const questions = [];

if (!program.workspace) {
    questions.push({
        type   : 'input',
        name   : 'workspace',
        message: 'Please choose a name for your neo workspace:',
        default: 'workspace'
    });
}

if (!program.appName) {
    questions.push({
        type   : 'input',
        name   : 'appName',
        message: 'Please choose a name for your neo app:',
        default: 'MyApp'
    });
}

if (!program.themes) {
    questions.push({
        type   : 'list',
        name   : 'themes',
        message: 'Please choose a theme for your neo app:',
        choices: ['neo-theme-dark', 'neo-theme-light', 'all', 'none'],
        default: 'all'
    });
}

if (!program.mainThreadAddons) {
    questions.push({
        type   : 'checkbox',
        name   : 'mainThreadAddons',
        message: 'Please choose your main thread addons:',
        choices: ['AmCharts', 'GoogleAnalytics', 'HighlightJS', 'LocalStorage', 'MapboxGL', 'Markdown', 'Siesta', 'Stylesheet'],
        default: ['Stylesheet']
    });
}

const handleError = e => {
    console.error('ERROR! An error was encountered while executing');
    console.error(e);
    console.log('Exiting with error.');
    process.exit(1);
};

const handleExit = () => {
    logBuildTime();
    console.log('Exiting without error.');
    process.exit();
};

const logBuildTime = () => {
    const processTime = (Math.round((new Date - startDate) * 100) / 100000).toFixed(2);
    console.log(`Total time: ${processTime}s`);
};

process.on('SIGINT', handleExit);
process.on('uncaughtException', handleError);

inquirer.prompt(questions).then(answers => {
    let workspace        = program.workspace || answers['workspace'],
        appName          = program.appName   || answers['appName'],
        mainThreadAddons = program.appName   || answers['mainThreadAddons'],
        themes           = program.themes    || answers['themes'],
        appPath          = path.join(workspace, '/apps/', appName.toLowerCase(), '/');

    if (!Array.isArray(themes)) {
        themes = [themes];
    }

    fs.mkdirp(appPath, err => {
        if (err) {
            throw err;
        }

        require('./createApp')          .init(appName, appPath, fs, os, path);
        require('./createIndexHtml')    .init(appName, appPath, fs, mainThreadAddons, os, path, themes);
        require('./createMainContainer').init(appName, appPath, fs, os, path);
        require('./createEntrypoint')   .init(appName, fs, os, path, workspace);
        require('./createGitignore')    .init(workspace, fs, os, path);
        require('./createMyAppsJson')   .init(appName, workspace, fs, mainThreadAddons, os, path, themes);
        require('./createPackageJson')  .init(appName, workspace, fs, os, path);

        const cpOpts = { env: process.env, cwd: workspace, stdio: 'inherit' };

        // npm install
        cp.spawnSync(npmCmd, ['i'], cpOpts);

        require('./copyDocsApp').init(fs, os, path, workspace);

        cp.spawnSync('node', ['./node_modules/neo.mjs/buildScripts/buildAll.js', '-n', '-l', 'no'], {
            cwd: path.join(process.cwd(), workspace),
            env: process.env,
            stdio: 'inherit'
        });

        /*
        cp.spawnSync(npmCmd, ['run', 'generate-docs-json'],       cpOpts);

        cp.spawnSync(npmCmd, ['run', 'dev-build-all-my-apps'],    cpOpts);
        cp.spawnSync(npmCmd, ['run', 'prod-build-all-my-apps'],   cpOpts);

        cp.spawnSync(npmCmd, ['run', 'dev-build-main'],           cpOpts);
        cp.spawnSync(npmCmd, ['run', 'prod-build-main'],          cpOpts);

        if (!themes.includes('none')) {
            cp.spawnSync(npmCmd, ['run', 'dev-css-structure'],    cpOpts);
            cp.spawnSync(npmCmd, ['run', 'prod-css-structure'],   cpOpts);

            if (themes.includes('both') || themes.includes('neo-theme-dark')) {
                cp.spawnSync(npmCmd, ['run', 'dev-theme-dark'],   cpOpts);
                cp.spawnSync(npmCmd, ['run', 'prod-theme-dark'],  cpOpts);
            }

            if (themes.includes('both') || themes.includes('neo-theme-light')) {
                cp.spawnSync(npmCmd, ['run', 'dev-theme-light'],  cpOpts);
                cp.spawnSync(npmCmd, ['run', 'prod-theme-light'], cpOpts);
            }
        }
        */

        if (program.start === 'true') {
            logBuildTime();
            cp.spawnSync(npmCmd, ['run', 'server-start'], cpOpts);
        } else {
            // Cleanup
            handleExit();
        }
    });
});