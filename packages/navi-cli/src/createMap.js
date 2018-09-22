import createDOMFactory from './createDOMFactory'
import { StaticNavigation } from 'junctions'

export default async function createMap(source, publicFolder) {
    let createDOM = createDOMFactory(source, publicFolder)

    let queue = ['']
    let processedJunctions = []
    let map = {}

    function addPathToQueue(pathname) {
        if (!map[pathname]) {
            queue.push(pathname)
        }
    }

    function getCanonicalPathname(pathname) {
        return pathname.substr(-1) === '/' ? pathname : pathname + '/'
    }

    function addJunctionChildrenToQueue(junction, pathname) {
        if (junction) {
            let canonicalPathname = getCanonicalPathname(pathname)
            if (!processedJunctions.includes(canonicalPathname)) {
                processedJunctions.push(canonicalPathname)
                Object.keys(junction.children)
                    .filter(pattern => pattern.indexOf(':') === -1)
                    .forEach(pattern => addPathToQueue(canonicalPathname + pattern.substr(1)))
            }
        }
    }

    let dom = createDOM()

    async function processURL(pathname) {
        let canonicalPathname = getCanonicalPathname(pathname)

        let dependencies = []
        let dom = createDOM(dependencyPathname => {
            dependencies.push(dependencyPathname)
        })
        let rootJunctionTemplate = dom.window.JunctionsStaticApp.root

        let navigation = new StaticNavigation({
            location: { pathname: canonicalPathname },
            rootJunctionTemplate
        })

        let route = await navigation.getFinalRoute()
        let finalSegment = route && route[route.length - 1]

        if (finalSegment.type === 'redirect') {
            let redirectPath = finalSegment.to.pathname
            map[canonicalPathname] = {
                pathname: canonicalPathname,
                dependencies: dependencies,
                redirect: redirectPath,
            }
            addPathToQueue(redirectPath)

            let finalJunction = route[route.length - 2]
            addJunctionChildrenToQueue(finalJunction, finalJunction.location.pathname)
        }
        else if (finalSegment.type === 'page') {
            map[canonicalPathname] = {
                pathname: canonicalPathname,
                dependencies: dependencies,
                title: finalSegment.title,
                meta: finalSegment.meta,
            }

            let finalJunction = route[route.length - 2]
            addJunctionChildrenToQueue(finalJunction, finalJunction.location.pathname)
        }
        else {
            // if the last segment is a junction, but its path is shorter than
            // the request path, then it means we couldn't find the requested path.
            if (finalSegment.location.pathname.length < pathname.length) {
                console.warn(`The path ${pathname} was referenced from a junction, but it doesn't exist! Skipping.`)
            }
            else {
                addJunctionChildrenToQueue(finalSegment, pathname)
            }
        }
    }

    while (queue.length) {
        let pathname = queue.shift()
        await processURL(pathname)
    }

    return map
}
