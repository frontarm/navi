const chalk = require('chalk')
const { createRouter } = require('navi')
const { createScriptRunner } = require('./createScriptRunner')

function formatMap(siteMap) {
    let map =''
    for (let url of Object.keys(siteMap.pages)) {
        map += chalk.blue("[html]     ")+url+"\n"
    }

    for (let [url, redirectRoute] of Object.entries(siteMap.redirects)) {
        map += chalk.yellow("[redirect] ")+url+chalk.grey(" -> "+redirectRoute.to)+"\n"
    }
    return map
}

async function createMap(config) {
    let scriptRunner = await createScriptRunner(config)
    let app = await scriptRunner()

    if (!app.pages) {
        throw new Error(`Couldn't find window.NaviScripts - did you call register()?`)
    }

    let router = createRouter({
        matcher: app.pages,
        context: config.context,
    })

    return await router.resolveSiteMap('/', {
        followRedirects: true,
        ...config.resolveSiteMapOptions,
    })
}

module.exports = {
    createMap,
    formatMap,
}