import createDOMFactory from './createDOMFactory'
import { StaticNavigation } from 'junctions'

export default async function createMap(mainFile, publicFolder) {
    let createDOM = createDOMFactory(mainFile, publicFolder)
    let queue = ['']
    let map = {}

    async function processURL(pathname) {
        let dependencies = []
        let dom = createDOM(pathname => {
            dependencies.push(pathname)
        })
        let rootJunction = dom.window.rootJunction

        let navigation = new StaticNavigation({
            initialLocation: { pathname },
            rootJunction,
            onEvent: (eventType, location) => {
                // TODO: can use this to build a map of dependencies for each chunk,
                // as opposed to dependencies for each URL. Then can build a list of
                // files to push with HTTP/2 each time somebody requests a chunk
            }
        })

        let rootRoute = await navigation.getFinalRootRoute()
        let deepestRoute = rootRoute.descendents[rootRoute.descendents.length - 1]

        if (deepestRoute.type === 'RedirectRoute') {
            let redirectPath = deepestRoute.to.pathname
            map[pathname] = {
                pathname: pathname,
                dependencies: dependencies,
                redirect: redirectPath,
            }
            if (!map[redirectPath]) {
                queue.push(redirectPath)
            }
        }
        else if (deepestRoute.type === 'PageRoute' && (!deepestRoute.contentStatus || deepestRoute.contentStatus === 'ready')) {
            map[pathname] = {
                pathname: pathname,
                dependencies: dependencies,
                meta: deepestState.meta,
            }
        }
        else {
            console.warn(`Could not load the junction associated with path "${pathname}".`)
            return
        }

        if (deepestRoute.source instanceof Junction) {
            let junction = deepestRoute.source
            Object.keys(junction.children)
                .filter(pattern => pattern.indexOf(':') === -1)
                .forEach(pattern => {
                    let pathname = deepestRoute.location.pathname + pattern
                    if (!map[pathname]) {
                        queue.push(pathname)
                    }
                })
        }
    }

    while (queue.length) {
        let pathname = queue.shift()
        await processURL(pathname)
    }

    return map
}
