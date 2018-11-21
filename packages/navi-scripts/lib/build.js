const { createMemoryNavigation } = require('navi')
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

    // TODO: if we've already written to a specific redirect file,
    // append instead of replacing. This will allow support of
    // surge.sh router files:
    // https://surge.sh/help/adding-redirects
    for (let { url, to, meta } of Object.values(siteMap.redirects)) {
        let options = {
            url,
            siteMap,
            config,
            meta,
            to,
        }
        let pathname = config.getRedirectPathname(options)
        console.log(chalk.yellow("[redirect] ")+pathname+chalk.grey(" -> "+to))
        let text = await config.renderRedirectToString(options)
        let filesystemPath = path.resolve(config.root, pathname)

        await fs.ensureDir(path.dirname(filesystemPath))
        await fs.writeFile(filesystemPath, text)
    }
}

module.exports = {
    build,
}