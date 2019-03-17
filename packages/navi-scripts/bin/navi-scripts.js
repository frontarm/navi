#!/usr/bin/env node
const packageJSON = require('../package.json')
const chalk = require('chalk')
const program = require('commander')
const path = require('path')
const fs = require('fs-extra')
const dotenv = require('dotenv')
const { processConfig, configSchema, defaultConfig } = require('../lib/config')

dotenv.config()

let defaultHost = process.platform === 'win32'
  ? 'localhost'
  : '0.0.0.0'

// Allow config files and their imported files to use ES6 modules and
// recent JavaScript features.
require("@babel/register")({
  babelrc: false,
  configFile: false,
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: true,
        }
      }
    ]
  ]
})

async function createConfigFromCommand(command) {
  let cwd = process.cwd()
  let config
  let configFile = command.config || 'navi.config.js'
  // Load the config file as an ES6 module
  let configPath = path.resolve(cwd, configFile)
  let configFileExists = fs.existsSync(configPath)

  if (configFileExists) {
    try {
      config = require(configPath)
    }
    catch (e) {
      console.error(chalk.green('navi-scripts:')+chalk.red("[ohshit] ")+`Couldn't read config file "${configPath}". Aborting.`)
      console.error(e.message)
      process.exit(1)
    }
    console.log(chalk.green('navi-scripts:')+' Using config at '+configPath)
  }
  else {
    console.log(chalk.green('navi-scripts:')+' No config file found, using default config.')
    config = {}
  }

  if (command.root) {
    config.root = path.resolve(cwd, command.root)
  }
  if (command.entry) {
    config.entry = path.resolve(cwd, command.entry)
  }

  try {
    return await processConfig(config)
  }
  catch (error) {
    console.error(chalk.red("[ohshit] ")+chalk.whiteBright("The config file couldn't be validated."))
    console.error(error.message)
    process.exit(1)
  }
}


program
  .version(packageJSON.version)
  .usage('[command] [options]')

program.command('build')
  .description("Build html files for each of your apps pages.")
  .option('-r, --root [directory]', configSchema.properties.root.description, defaultConfig.root)
  .option('-e, --entry [file]', configSchema.properties.entry.description, defaultConfig.entry)
  .option('-c, --config [file]', 'Specify a config file.')
  .action(async function (command) {
    let config = await createConfigFromCommand(command)
    let build = require('../lib/build').build

    try {
      await build(config)
    }
    catch (error) {
      console.error(chalk.red("[ohshit] ")+chalk.whiteBright("An error occured while building your app"))
      console.error(error.message)
      console.error(error.stack)
      process.exit(1)
    }
  })

program.command('crawl')
  .alias('map')
  .description('Crawls your site and outputs all statically-buildable URLs.')
  .option('-j, --json', 'Output the result as json.')
  .option('-r, --root [directory]', configSchema.properties.root.description, defaultConfig.root)
  .option('-e, --entry [file]', configSchema.properties.entry.description, defaultConfig.entry)
  .option('-c, --config [file]', 'Specify a config file.')
  .option('-o, --output [file]', 'Write the map to a file.')
  .action(async function (command) {
    let config = await createConfigFromCommand(command)
    let { crawl, formatCrawlResult } = require('../lib/crawl')
    try {
      let map = await crawl(config)
      let string = !command.json ? formatCrawlResult(map) : JSON.stringify(map, undefined, 2)
      if (command.output) {
        await fs.writeFile(command.output, string)
      }
      else {
        console.log(string)
      }
    }
    catch (error) {
      console.error(chalk.red("[ohshit] ")+chalk.whiteBright("An error occured while building your map"))
      console.error(error.message)
      console.error(error.stack)
      process.exit(1)
    }
  })

program.command('serve')
  .description('Serve the build directory.')
  .option('-H, --host <url>',
          `Set host. Defaults to ${defaultHost}`,
          defaultHost
         )
  .option('-p, --port <port>', 'Set port. Defaults to 3000', '3000')
  .option('-r, --root [directory]', 'The directory to serve.', defaultConfig.root)
  .action(function (command) {
    let serve = require('../lib/serve').serve
    serve(command)
  })

program.on('--help', function() {
  console.log(`To show subcommand help:
    navi [command] -h
  `)
})


program.parse(process.argv)


function exitWithError(message, error) {
  console.error(chalk.red("[ohshit] ")+chalk.whiteBright(message))
  if (error && error.message) {
    console.error(error.message)
  }
  process.exit(1)
}
