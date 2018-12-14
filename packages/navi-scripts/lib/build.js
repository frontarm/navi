const chalk = require('chalk')
const path = require('path')
const { createScriptRunner } = require('./createScriptRunner')
const { createMap } = require('./map')

async function build(config) {
    let fs = config.fs
    let siteMap = await createMap(config)
    let scriptRunner = await createScriptRunner(config)

    for (let { url } of Object.values(siteMap.pages)) {
        let dependencies = []
        let app = await scriptRunner({
            onScriptLoaded: (pathname) => dependencies.push(pathname),
        })
        let options = {
            app,
            pages: app.pages,
            exports: app.exports,
            url,
            siteMap,
            dependencies,
            config,
        }
        let pathname = config.getPagePathname(options)
        console.log(chalk.blue("[html]     ")+pathname)
        let html = await config.renderPageToString(options)
        let filesystemPath = path.resolve(config.root, pathname)

        await fs.ensureDir(path.dirname(filesystemPath))
        await fs.writeFile(filesystemPath, html)
    }

    // Leave the redirect rendering logic to configuration, as it varies
    // considerably between hosting platforms.
    if (config.createRedirectFiles) {
        config.createRedirectFiles({
            siteMap,
            config,
        })
    }
}

module.exports = {
    build,
}