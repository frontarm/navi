import fs from 'fs'
import path from 'path'
import vm from 'vm'
const jsdom = require('jsdom/lib/old-api.js')


export default function createDOMFactory(mainFile, publicFolder) {
    let cwd = process.cwd()
    let source = fs.readFileSync(path.resolve(cwd, mainFile))
    let script = new vm.Script(source, {
        displayErrors: true,
        filename: 'main.js',
        timeout: 1000,
    })

    let factory = (onLoad) => {
        let doc = jsdom.jsdom('', {
            virtualConsole: jsdom.createVirtualConsole().sendTo(console),
            resourceLoader: function (resource, callback) {
                var pathname = resource.url.pathname

                if (!publicFolder) {
                    console.error(`Your app requested file "${pathname}", but I don't know where to look! Try setting the --public option.`)
                    process.exit(1)
                }

                let relativePathname = pathname[0] === '/' ? pathname.slice(1) : pathname
                let filesystemPath = path.resolve(cwd, publicFolder, relativePathname)

                if (/\.js$/.test(pathname)) {
                    fs.readFile(filesystemPath, "utf8", (err, data) => {
                        if (err) {
                            return callback(err)
                        }

                        if (onLoad) {
                            onLoad(pathname)
                        }

                        callback(null, '"use strict";\n' + data)
                    })
                }
                else {
                    return resource.defaultFetch(callback)
                }
            },
        });
        let dom = doc.defaultView
        jsdom.evalVMScript(dom, script)
        return dom
    }

    let testDOM = factory()
    let App = testDOM.window.ReactApp
    if (!App) {
        console.error(`The file "${mainFile}" was found, but doesn't assign an "ReactApp" property to the window object. Junctions-static requires that your apps exports are available on this property.'`)
        process.exit(1)
    }
    else if (!App.rootJunctionTemplate) {
        console.log(App)
        console.error(`Your app must export a "rootJunctionTemplate" property.`)
        process.exit(1)
    }
    
    return factory
}
