
const { processConfig } = require('./config')
const { createScriptRunner } = require('./createScriptRunner')
const { build } = require('./build')
const { crawl } = require('./crawl')

module.exports = {
  createScriptRunner: async (config, ...args) => createScriptRunner(await processConfig(config), ...args),
  crawl: async (config, ...args) => crawl(await processConfig(config), ...args),
  build: async (config, ...args) => build(await processConfig(config), ...args),
}