#!/usr/bin/env node

require('babel-register');
require('babel-polyfill');

var packageJSON = require('../package.json')
var program = require('commander')
var path = require('path')
var fs = require('fs')

var packageRoot = fs.realpathSync(process.cwd());

var defaultHost = process.platform === 'win32'
  ? 'localhost'
  : '0.0.0.0'


function getConfig(command) {
    // todo:
    // - get options from config file if possible
    // - expand globs where necessary

    //   const configPath = path.resolve(packageRoot, command.config)
    //   const configModule = require(configPath)
    //   const config = typeof configModule === 'function' ? configModule : configModule.default

    //   return Object.assign({}, command, {
    //     packageRoot: packageRoot,
    //     siteRoot: path.dirname(configPath),
    //     config: config({ environment: process.env.NODE_ENV }),
    //   })

    return command
}


program
  .version(packageJSON.version)
  .usage('[command] [options]')

program.command('build')
  .description('Build HTML files for a junctions-based app.')
  .option('-p, --public [directory]', 'The path where files will be written, and where static assets are located.', 'build')
  .option('-m, --main [file]', 'The file that holds your main function and root junction.')
  .option('-r, --render [file]', 'The file that holds your render function.', 'src/renderToString.js')
  .action(function (command) {
    var build = require('../lib/scripts/build').default
    var config = getConfig(command)

    if (!config.main) {
      console.error('You must specify a "main" file.')
      process.exit(1)
    }
    if (!config.public) {
      console.error('You must specify a "public" file.')
      process.exit(1)
    }
    if (!config.render) {
      console.error('You must specify a "render" file.')
      process.exit(1)
    }

    build(config.main, config.public, config.render).catch(function(err) {
      console.error(err)
      process.exit(1)
    })
  })

program.command('map')
  .description('Output a map of all statically-buildable URLs within your root junction.')
  .option('-p, --public [directory]', 'The path where static assets are located.', 'build')
  .option('-m, --main [file]', 'The file that holds your root junction.')
  .action(function (command) {
    var map = require('../lib/scripts/map').default
    var config = getConfig(command)

    if (!config.main) {
      console.error('You must specify a "main" file.')
      process.exit(1)
    }

    map(config.main, config.public).catch(function(err) {
      console.error(err)
      process.exit(1)
    })
  })

program.command('view')
  .description('View built site.')
  .option('-H, --host <url>',
          `Set host. Defaults to ${defaultHost}`,
          defaultHost
         )
  .option('-p, --port <port>', 'Set port. Defaults to 4000', '4000')
  .option('-d, --directory [directory]', 'The directory to serve.', 'build')
  .action(function (command) {
    var serve = require('../lib/scripts/view').default
    serve(command)
  })

program.on('--help', function() {
  console.log(`To show subcommand help:
    sitepack [command] -h
  `)
})


program.parse(process.argv)
