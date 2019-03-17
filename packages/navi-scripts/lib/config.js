const Ajv = require('ajv')
const fs = require('fs-extra')
const path = require('path')

const ajv = new Ajv({
	allErrors: true,
	verbose: true,
});
require('ajv-keywords')(ajv, ["typeof"]);


const defaultConfig = {
  getPagePathname: ({ url }) => {
    return url === '/' ? 'index.html' : path.join(url.pathname.slice(1), 'index.html')
  },
  createRedirectFiles: async ({ config, redirects }) => {
    const chalk = require("chalk")
    const fs = config.fs

    for (let [url, to] of Object.entries(redirects)) {
      let pathname = url === '/' ? 'index.html' : path.join(url.split('?')[0].slice(1), 'index.html')

      console.log(chalk.yellow("[redirect] ")+pathname+chalk.grey(" -> "+to))

      let filesystemPath = path.resolve(config.root, pathname)

      await fs.ensureDir(path.dirname(filesystemPath))
      await fs.writeFile(filesystemPath, `<meta http-equiv="refresh" content="0; URL='${to}'" />`)
    }
  },
  context: {},
  root: 'build',
  entry: 'build/index.html',
  appGlobal: 'NaviScripts',
  fs: {
    readFile: fs.readFile,
    writeFile: fs.writeFile,
    ensureDir: fs.ensureDir,
    exists: fs.exists,
  },
}

const configSchema = {
  type: "object",
  additionalProperties: false,
  required: ['entry', 'renderPageToString'],
  properties: {
    root: {
      description: `The directory that all files will be read from and written to.`,
      type: 'string',
    },
    entry: {
      description: `The file that sets "window.exports", relative to root.`,
      type: 'string',
    },
    context: {
      description: `The Navi context that will be used when building a site map.`,
    },
    
    appGlobal: {
      description: `The property of the "window" object where your entry file places its exports.`,
      type: 'string',
    },
    renderPageToString: {
      description: `The path to a module that exports a default function that accepts an { exports, url, paths, dependencies } object, and returns the page's contents as a string.`,
      type: 'string',
    },
    getPagePathname: {
      description: `A function that accepts an { exports, url, paths } object, and returns the path under the root directory where the page's contents will be written to.`,
      typeof: 'function',
    },
    createRedirectFiles: {
      description: `A function that accepts an { redirects, config } object, and creates any appropriate files to represent redirects.`,
      typeof: ['undefined', 'function'],
    },
    fs: {
      type: "object",
      properties: {
        readFile: {
          description: `The function that will be used to read script files`,
          typeof: 'function',
        },
        writeFile: {
          description: `The function that will be used to write output files`,
          typeof: 'function',
        },
        ensureDir: {
          description: `The function that will be used to create directories before writing to them`,
          typeof: 'function',
        },
        exists: {
          description: `The function that will be used to check if a file or directory exists`,
          typeof: 'function',
        },
      },
    },
  }
}

async function processConfig(config) {
  config = Object.assign(
    {},
    defaultConfig,
    {
      ...config,
      fs: {
        ...defaultConfig.fs,
        ...config.fs,
      }
    }
  )

  if (!config.renderPageToString) {
    let reactNaviCreateReactApp
    try {
      reactNaviCreateReactApp = require.resolve('react-navi/create-react-app')
    }
    catch (e) {}

    if (reactNaviCreateReactApp) {
      console.log('Using create-react-app renderer...')
      config.renderPageToString = reactNaviCreateReactApp
    }
  }

  if (!ajv.validate(configSchema, config)) {
    throw new Error(ajv.errorsText())
  }

  let exists = config.fs.exists
  let entry = path.resolve(config.root, config.entry)

  if (!(await exists(config.renderPageToString))) {
    throw new Error(`Could not read the renderPageToString file "${config.renderPageToString}".`)
  }

  if (!(await exists(entry))) {
    throw new Error(`Could not read the entry file "${entry}".`)
  }

  let originalReadfile = config.fs.readFile
  let cache = {}
  config.fs.readFile = (pathname) => {
    let cached = cache[pathname] 
    if (!cached) {
      cached = cache[pathname] = originalReadfile(pathname)
    }
    return cached
  }

  return Object.freeze(config)
}


module.exports = {
  processConfig,
  configSchema,
  defaultConfig,
}