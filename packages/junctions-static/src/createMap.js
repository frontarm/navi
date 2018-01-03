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

        let rootNode = await navigation.getFinalState()
        let deepestNode = rootNode.activeDescendents && rootNode.activeDescendents[rootNode.activeDescendents.length - 1]

        if (!deepestNode) {
            console.warn(`Could not load the junction associated with path "${pathname}".`)
            return
        }

        if (deepestNode.type === 'redirect') {
            let redirectPath = deepestNode.to.pathname
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
        else if (deepestNode.type === 'page' && (!deepestNode.contentStatus || deepestNode.contentStatus === 'ready')) {
            map[pathname] = {
                pathname: pathname,
                dependencies: dependencies,
                title: deepestNode.title,
                meta: deepestNode.meta,
            }
        }
        else if (deepestNode.definition.mountableType !== 'Junction') {
            console.warn(`Could not load the junction associated with path "${pathname}".`)
        }
        
        if (deepestNode.definition.mountableType === 'Junction') {
            addJunctionChildrenToQueue(deepestNode.definition, deepestNode.location.pathname)
        }
    }

    while (queue.length) {
        let pathname = queue.shift()
        await processURL(pathname)
    }

    return map
}
