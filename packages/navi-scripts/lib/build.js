const chalk = require('chalk')
const { dirname, resolve } = require('path')
const { createURLDescriptor } = require('navi')
const { createScriptRunner } = require('./createScriptRunner')
const { crawl } = require('./crawl')

async function build(config) {
    let fs = config.fs
    let { paths, redirects } = await crawl(config)
    let scriptRunner = await createScriptRunner(config)

    for (let path of paths) {
        let dependencies = {
            scripts: new Set,
            stylesheets: new Set,
        }
        let app = await scriptRunner({
            onScriptLoaded: (pathname) => dependencies.scripts.add(pathname),
            onStyleSheetLoaded: (pathname) => dependencies.stylesheets.add(pathname),
        })
        let options = {
            app,
            routes: app.routes,
            exports: app.exports,
            paths,
            redirects,
            url: createURLDescriptor(path),
            dependencies,
            config,
        }

        let html, pathname
        let resolvedModulesNames = []
        let nodeEnv = process.env.NODE_ENV
        let oldCacheKeys = new Set(Object.keys(require.cache))
        try {
            for (let moduleName of Object.keys(app.sharedModules || {})) {
                let resolvedName = require.resolve(moduleName)
                resolvedModulesNames.push(resolvedName)
                require.cache[resolvedName] = {
                    id: resolvedName,
                    filename: resolvedName,
                    loaded: true,
                    exports: app.sharedModules[moduleName]
                };
            }

            pathname = config.getPagePathname(options)
            console.log(chalk.blue("[html]     ")+pathname)

            process.env.NODE_ENV = app.environment

            let renderPageToStringModule = require(config.renderPageToString)
            let renderPageToString = renderPageToStringModule.default || renderPageToStringModule
            
            html = await renderPageToString(options)
        }
        catch (e) {
            throw e
        }
        finally {
            process.env.NODE_ENV = nodeEnv

            for (let key of Object.keys(require.cache)) {
                if (!oldCacheKeys.has(key)) {
                    delete require.cache[key]
                }
            }
        }

        let filesystemPath = resolve(config.root, pathname)

        await fs.ensureDir(dirname(filesystemPath))
        await fs.writeFile(filesystemPath, html)
    }

    // Leave the redirect rendering logic to configuration, as it varies
    // considerably between hosting platforms.
    if (config.createRedirectFiles) {
        config.createRedirectFiles({
            redirects,
            config,
        })
    }
}

module.exports = {
    build,
}