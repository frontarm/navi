const path = require('path')
const vm = require('vm')
const jsdom = require('jsdom')

/**
 * Creates a function that can be used to run the script supplied at `entry`,
 * and returns the script's exports as defined by the `exportsGlobal`
 * config option.
 * 
 * Each call to the returned runner is run in a new VM.
 */
async function createScriptRunner(config) {
    let fs = config.fs

    let ext = path.extname(config.entry).slice(1)
    let source = (await fs.readFile(path.resolve(config.root, config.entry))).toString('utf8')
    let factory

    async function createDOM(html='', options) {
        class ResourceLoader extends jsdom.ResourceLoader {
            constructor(queue) {
                super()
                this.queue = queue
            }

            async fetch(url, fetchOptions) {
                if (process.env.PUBLIC_URL) {
                    url = url.replace(process.env.PUBLIC_URL, '')
                }

                let relativePathname = url[0] === '/' ? url.slice(1) : url
                let filesystemPath = path.join(config.root, relativePathname)

                if (/\.js$/.test(relativePathname)) {
                    let file = fs.readFile(filesystemPath)
                    this.queue.push(Promise.resolve(file))
                    let data = await file
                    
                    if (options.onScriptLoaded) {
                        options.onScriptLoaded(url)
                    }
                    
                    return data;
                }
                else {
                    return Buffer.from('')
                    // Let's just ignore any remote files.
                    // return super.fetch(url, fetchOptions);
                }
            }
        }

        let queue = []
        let dom = new jsdom.JSDOM(html, {
            virtualConsole: new jsdom.VirtualConsole().sendTo(console),
            resources: new ResourceLoader(queue),
            runScripts: "dangerously",
            beforeParse(window) {
                // Polyfill rAF for react
                window.requestAnimationFrame = require('raf')
                window.cancelAnimationFrame = require('raf').cancel
                
                // jsdom seems to choke on webpack's <link> tag loader,
                // so I'm manually calling any onload handlers instead
                // to avoid a deadlock.
                // TODO: get links actually working.
                let appendChild = window.HTMLHeadElement.prototype.appendChild
                window.HTMLHeadElement.prototype.appendChild = function(...args) {
                    let result = appendChild.apply(this, args)
                    if (args[0] instanceof window.HTMLLinkElement && args[0].onload) {
                        if (args[0].rel === "stylesheet" && options.onStyleSheetLoaded) {
                            options.onStyleSheetLoaded(args[0].href)
                        }
                        args[0].onload()
                    }
                    return result
                }
            },
        }) 

        while (await queue.shift()) {}
        
        return dom
    }

    if (ext === 'js') {
        let script = new vm.Script(source, {
            displayErrors: true,
            filename: path.basename(config.entry),
            timeout: 1000,
        })
        factory = async (options = {}) => {
            let dom = await createDOM('', options)
            try {
                dom.runVMScript(script)
            }
            catch (e) {
                console.error("Failed running app:", e)
            }
            return dom.window[config.appGlobal]
        }
    }
    else if (ext === 'html') {
        source = source.replace(
            `<head>`,
            `<head><script>window.${config.appGlobal} = { isBuild: true }</script>`
        )

        factory = async (options = {}) => {
            let dom = await createDOM(source, options)
            return dom.window[config.appGlobal]
        }
    }
    else {
        throw new Error('Unknown file extension for entry point "${config.entry}".')
    }

    let test = await factory()
    if (!test) {
        throw new Error(`Could not find the "window.${config.appGlobal}" value in your entry point "${config.entry}".`)
    }

    return factory
}

module.exports = {
    createScriptRunner,
}