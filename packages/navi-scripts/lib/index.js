
const { processConfig } = require('./config')
const { createScriptRunner } = require('./createScriptRunner')
const { build } = require('./build')
const { createMap } = require('./map')

module.exports = {
  createScriptRunner: async (config, ...args) => createScriptRunner(await processConfig(config), ...args),
  createMap: async (config, ...args) => createMap(await processConfig(config), ...args),
  build: async (config, ...args) => build(await processConfig(config), ...args),
}