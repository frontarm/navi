const chalk = require('chalk')
const Navi = require('navi')
const { createScriptRunner } = require('./createScriptRunner')

function formatCrawlResult(crawlResult) {
    let map =''
    for (let url of crawlResult.paths) {
        map += chalk.blue("[html]     ")+url+"\n"
    }

    for (let [url, to] of Object.entries(crawlResult.redirects)) {
        map += chalk.yellow("[redirect] ")+url+chalk.grey(" -> "+to)+"\n"
    }
    return map
}

async function crawl(config) {
    let scriptRunner = await createScriptRunner(config)
    let app = await scriptRunner()

    if (!app.routes) {
        throw new Error(`Couldn't find window.NaviScripts - did you call register()?`)
    }

    return await Navi.crawl({
        routes: app.routes,
        context: config.context,
    })
}

module.exports = {
    crawl,
    formatCrawlResult,
}