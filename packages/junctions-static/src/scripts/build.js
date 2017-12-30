import path from 'path'
import fs from 'fs-extra'
import createMap from '../createMap'
import createDOMFactory from '../createDOMFactory'


export default async function build(mainFile, publicFolder, renderToString) {
    let cwd = process.cwd()
    let siteMap = await createMap(mainFile, publicFolder)
    let createDOM = createDOMFactory(mainFile, publicFolder)
    let dom = createDOM()
    let rootJunction = dom.window.rootJunction
    let pathnames = Object.keys(siteMap)
    
    await Promise.all(pathnames.map(async function(pathname) {
        let details = siteMap[pathname]
        let publicPath = pathname === '/' ? 'index.html' : path.join(pathname.slice(1), 'index.html')
        let filesystemPath = path.resolve(cwd, publicFolder, publicPath)

        if (details.redirect) {
            await fs.ensureDir(path.dirname(filesystemPath))
            return fs.writeFile(filesystemPath+'.headers', "x-amz-website-redirect-location: "+details.redirect)
        }
        else {
            let html = await renderToString({
                junction: rootJunction,
                location: { pathname },
                meta: details.meta,
                dependencies: details.dependencies,
            })

            await fs.ensureDir(path.dirname(filesystemPath))
            return fs.writeFile(filesystemPath, html)
        }
    }))
}
