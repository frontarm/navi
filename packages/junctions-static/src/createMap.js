import createDOMFactory from './createDOMFactory'
import { JunctionManager } from 'junctions'

export default async function createMap(mainFile, publicFolder) {
    let createDOM = createDOMFactory(mainFile, publicFolder)
    let queue = ['/']
    let map = {}

    async function processURL(pathname) {
        let dependencies = []
        let dom = createDOM(pathname => {
            dependencies.push(pathname)
        })
        let rootJunction = dom.window.rootJunction

        let manager = new JunctionManager({
            initialLocation: { pathname },
            rootJunction,
            onEvent: (eventType, location) => {
                // TODO: can use this to build a map of dependencies for each chunk,
                // as opposed to dependencies for each URL. Then can build a list of
                // files to push with HTTP/2 each time somebody requests a chunk
            }
        })

        let state = manager.getState()

        if (manager.isBusy()) {
            await new Promise((resolve, reject) =>
                manager.subscribe((newState, oldState, isBusy) => {
                    state = newState
                    if (!isBusy) {
                        resolve()
                    }
                })
            )
        }
        
        let junction = await manager.getJunction({ pathname })
        
        let deepestState = state
        while (deepestState.child) {
            deepestState = deepestState.child
        }

        if (deepestState.childStatus) {
            console.warn(`Could not load the junction associated with path "${pathname}".`)
            return
        }

        if (deepestState.redirect) {
            map[pathname] = {
                pathname: pathname,
                dependencies: dependencies,
                redirect: deepestState.redirect,
            }
        }
        else {
            map[pathname] = {
                pathname: pathname,
                dependencies: dependencies,
                meta: deepestState.meta,
            }
        }

        if (junction.children) {
            Object.keys(junction.children)
                .filter(pattern => pattern.indexOf(':') === -1)
                .forEach(pattern => {
                    queue.push(deepestState.location.pathname + pattern)
                })
        }
    }

    while (queue.length) {
        let pathname = queue.shift()
        await processURL(pathname)
    }

    return map
}
