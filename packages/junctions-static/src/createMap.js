import createDOMFactory from './createDOMFactory'
import { StaticNavigation } from 'junctions'

export default async function createMap(mainFile, publicFolder) {
    let createDOM = createDOMFactory(mainFile, publicFolder)
    let queue = []
    let map = {}

    function addJunctionChildrenToQueue(junction, base='') {
        Object.keys(junction.children)
            .filter(pattern => pattern.indexOf(':') === -1)
            .forEach(pattern => {
                let pathname = base + pattern
                if (!map[pathname]) {
                    queue.push(pathname)
                }
            })
    }

    let dom = createDOM()
    addJunctionChildrenToQueue(dom.window.rootJunction)

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
        let deepestRoute = rootRoute.descendents && rootRoute.descendents[rootRoute.descendents.length - 1]

        if (!deepestRoute) {
            console.warn(`Could not load the junction associated with path "${pathname}".`)
            return
        }

        if (deepestRoute.type === 'RedirectRoute') {
            let redirectPath = deepestRoute.to.pathname
            if (redirectPath !== pathname+'/') {
                map[pathname] = {
                    pathname: pathname,
                    dependencies: dependencies,
                    redirect: redirectPath,
                }
            }
            if (!map[redirectPath]) {
                queue.push(redirectPath)
            }
        }
        else if (deepestRoute.type === 'PageRoute' && (!deepestRoute.contentStatus || deepestRoute.contentStatus === 'ready')) {
            map[pathname] = {
                pathname: pathname,
                dependencies: dependencies,
                title: deepestRoute.title,
                meta: deepestRoute.meta,
            }
        }
        else if (deepestRoute.source.mountableType !== 'Junction') {
            console.warn(`Could not load the junction associated with path "${pathname}".`)
        }
        
        if (deepestRoute.source.mountableType === 'Junction') {
            addJunctionChildrenToQueue(deepestRoute.source, deepestRoute.location.pathname)
        }
    }

    while (queue.length) {
        let pathname = queue.shift()
        await processURL(pathname)
    }

    return map
}
