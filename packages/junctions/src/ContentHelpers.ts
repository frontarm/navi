// import { Junction, JunctionMatcher } from './Junction'
// import { Route, PageRoute, JunctionRoute, JunctionRoute, RouteList } from './Route'
// import { matchMappingAgainstLocation } from './Mapping'
// import { Deferred } from './Deferred';
// import { Node, MaybeResolvableNode } from './Node'
// import { Location, concatLocations } from './Location'


// export interface ContentHelpers {
//     getPages<Pathnames extends { [name: string]: string }>(pathnames: Pathnames): Promise<{ [K in keyof Pathnames]: PageRoute }>
//     getPages(pathname: string): Promise<PageRoute>;

//     getRouteSegment(pathname: string): Promise<Route>;

//     // TODO: add option to follow redirects
//     getPageMap(junction: JunctionRoute, predicate?: JunctionMapPredicate): Promise<PageMap>;
// }

// export default interface PageMap {
//     [path: string]: PageRoute;
// }


// type JunctionMapPredicate = (segment: PageRoute | JunctionRoute) => boolean
// const defaultPredicate = (segment: PageRoute | JunctionRoute) => true


// export function createContentHelpers(routerConfig: RouterConfig): ContentHelpers {
//     function getPages<Pathnames extends { [name: string]: string }>(pathnames: Pathnames): Promise<{ [K in keyof Pathnames]: PageRoute }>;
//     function getPages(pathname: string): Promise<PageRoute>;
//     function getPages<Pathnames extends { [name: string]: string } | string>(pathnames: Pathnames): any {
//         if (typeof pathnames === 'string') {
//             return getPageNode({ pathname: pathnames }).then(page =>
//                 page ? Promise.resolve(page) : Promise.reject(undefined)
//             )
//         }
//         else {
//             let keys = Object.keys(pathnames)
//             let promises: Promise<PageRoute | undefined>[] = []
//             for (let i = 0; i < keys.length; i++) {
//                 let key = keys[i]
//                 promises.push(getPageNode({ pathname: pathnames[key] }))
//             }
//             return Promise.all(promises).then(values => {
//                 let result = {} as { [K in keyof Pathnames]: PageRoute }
//                 for (let i = 0; i < keys.length; i++) {
//                     let value = values[i]
//                     if (value === undefined) {
//                         return Promise.reject(undefined)
//                     }
//                     result[keys[i]] = value
//                 }
//                 return Promise.resolve(result)
//             })
//         }
//     }

//     /**
//      * Return a promise to a RouteSegment that corresponds to the given
//      * pathname, or reject the promise if a corresponding segment can't be
//      * found.
//      */
//     function getRouteSegment(pathname: string): Promise<Route> {
//         let deferred = new Deferred<Route>()
//         let searchLocation = {
//             // Add a trailing slash, in case the pathname corresponds directly
//             // to a junction with no '/' child -- otherwise no match will be
//             // found.
//             pathname: pathname.substr(-1) === '/' ? pathname : pathname + '/'
//         }
//         processFinalNodeWithoutContent(searchLocation, (route?: RouteList) => {
//             if (route) {
//                 let lastSegment = route[route.length - 1]
//                 if (lastSegment.location.pathname === pathname) {
//                     deferred.resolve(lastSegment)
//                 }
//                 else if (lastSegment.location.pathname === pathname+'/') {
//                     // If the user requested a segment without a trailing
//                     // slash, but we found one *with* a trailing slash, then
//                     // we've found a child of a requested junction.
//                     let lastJunction = route[route.length - 2]
//                     if (lastJunction) {
//                         deferred.resolve(lastJunction)
//                     }
//                 }
//             }
//             deferred.reject(undefined)
//         })
//         return deferred.promise
//     }

//     /**
//      * Walks through a junction, returning a map of all urls to routes objects.
//      * @param junction 
//      * @param predicate (optional) allows some pages to be omitted.
//      */
//     async function getPageMap(junction: JunctionRoute, predicate: JunctionMapPredicate = defaultPredicate): Promise<PageMap> {
//         let map = {} as PageMap
//         let template = junction.template as Junction
//         let children = Object.entries(template.children) as [string, Node | MaybeResolvableNode][]
//         let possiblePromises = [] as Promise<Route | undefined>[]
//         let queue = [junction]
//         while (queue.length) {
//             let junction = queue.shift() as JunctionRoute
//             for (let [pattern, template] of children) {
//                 let path = junction.location.pathname + pattern
//                 let segment = await getRouteSegment(path)
//                 if (segment.type !== 'redirect' && predicate(segment)) {
//                     if (segment.type === 'junction') {
//                         queue.push(junction)
//                     }
//                     else {
//                         map[path] = segment
//                     }
//                 }
//             }
//         }
//         return map
//     }

//     function getPageNode(location: Location): Promise<PageRoute | undefined> {
//         let deferred = new Deferred<PageRoute | undefined>()
//         processFinalNodeWithoutContent(location, (route?: JunctionRoute) => {
//             let lastSegment = route && route[route.length - 1]
//             if (!lastSegment || lastSegment.type === 'junction') {
//                 deferred.resolve(undefined)
//             }
//             else if (lastSegment.type === 'page') {
//                 return deferred.resolve(lastSegment)
//             }
//             else {
//                 getPageNode(lastSegment.to).then(deferred.resolve)
//             }
//         })
//         return deferred.promise
//     }

//     function processFinalNodeWithoutContent(location: Location, callback: (route?: JunctionRoute) => void) {
//         let match = matchMappingAgainstLocation(routerConfig.rootMountedPattern, location)
//         if (!match) {
//             callback()
//         }
//         else {
//             let deferred = new Deferred<PageRoute | undefined>()

//             const handleRouteChange = () => {
//                 if (!rootMatcher.isBusy()) {
//                     callback(rootMatcher.getRoute())
//                     rootMatcher.willUnmount()
//                 }
//             }

//             let rootMatcher = new routerConfig.rootJunctionTemplate({
//                 parentLocationPart: { pathname: '' },
//                 matchableLocationPart: location,
//                 mountedPattern: routerConfig.rootMountedPattern,
//                 onChange: handleRouteChange,
//                 routerConfig: routerConfig,
//                 shouldFetchContent: false,
//             })

//             handleRouteChange()
//         }
//     }

//     return {
//         getPages,
//         getRouteSegment,
//         getPageMap,
//     }
// }