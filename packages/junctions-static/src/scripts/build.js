import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import createMap from '../createMap'
import createDOMFactory from '../createDOMFactory'


export default async function build(mainFile, publicFolder, renderToString) {
    let cwd = process.cwd()
    let siteMap = await createMap(mainFile, publicFolder)
    let createDOM = createDOMFactory(mainFile, publicFolder)
    let dom = createDOM()
    let rootJunctionTemplate = dom.window.JunctionsStaticApp.root
    let pathnames = Object.keys(siteMap)

    console.log('\nCreating static files...\n')
    
    // Await each path in sequence so that error messages are output in order
    // with the filenames that caused them.
    for (let pathname of pathnames) {
        let details = siteMap[pathname]
        let publicPath = pathname === '/' ? 'index.html' : path.join(pathname.slice(1), 'index.html')
        let filesystemPath = path.resolve(cwd, publicFolder, publicPath)

        if (details.redirect) {
            await fs.ensureDir(path.dirname(filesystemPath))

            console.log(chalk.yellow("[redirect] ")+publicPath+chalk.grey(" -> "+details.redirect))

            await fs.writeFile(filesystemPath+'.headers', "x-amz-website-redirect-location: "+details.redirect)
        }
        else {
            console.log(chalk.blue("[html]     ")+publicPath)

            let html = await renderToString({
                rootJunctionTemplate: rootJunctionTemplate,
                location: { pathname },
                title: details.title,
                meta: details.meta,
                dependencies: details.dependencies,
            })

            await fs.ensureDir(path.dirname(filesystemPath))
            await fs.writeFile(filesystemPath, html)
        }
    }

    console.log('')
}
