import { JunctionTemplate, JunctionMatcher } from './JunctionTemplate'
import { Page, JunctionRoute, Junction } from './Route'
import { MountedPattern, matchMountedPatternAgainstLocation } from './Patterns'
import { Deferred } from './Deferred';
import { Template, AsyncTemplate } from './Template'
import { Location, concatLocations } from './Location'
import { RouterConfig } from './RouterConfig'


export interface ContentHelpers {
    getPages<Pathnames extends { [name: string]: string }>(pathnames: Pathnames): Promise<{ [K in keyof Pathnames]: Page }>
    getPages(pathname: string): Promise<Page>;

    getJunctionPages(pathname: string): Promise<Page[]>
}


export function createContentHelpers(routerConfig: RouterConfig) {
    function getPages<Pathnames extends { [name: string]: string }>(pathnames: Pathnames): Promise<{ [K in keyof Pathnames]: Page }>;
    function getPages(pathname: string): Promise<Page>;
    function getPages<Pathnames extends { [name: string]: string } | string>(pathnames: Pathnames): any {
        if (typeof pathnames === 'string') {
            return getPageNode({ pathname: pathnames }).then(page =>
                page ? Promise.resolve(page) : Promise.reject(undefined)
            )
        }
        else {
            let keys = Object.keys(pathnames)
            let promises: Promise<Page | undefined>[] = []
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i]
                promises.push(this.getPageNode({ pathname: pathnames[key] }))
            }
            return Promise.all(promises).then(values => {
                let result = {} as { [K in keyof Pathnames]: Page }
                for (let i = 0; i < keys.length; i++) {
                    let value = values[i]
                    if (value === undefined) {
                        return Promise.reject(undefined)
                    }
                    result[keys[i]] = value
                }
                return Promise.resolve(result)
            })
        }
    }

    /**
     * Return an array of PageNode objects for each child Page of the junction
     * denoted by the given path. Redirects and junctions will be excluded.
     * 
     * TODO: extend this with limit/offset options to facilitate pagination.
     */
    function getJunctionPages(pathname: string): Promise<Page[]> {
        let deferred = new Deferred<Page[]>()
        this.processFinalNodeWithoutContent({ pathname }, (route?: JunctionRoute) => {
            if (!route) {
                deferred.reject(undefined)
            }
            else {
                let junction: Junction | undefined
                let lastRoute = route[route.length - 1]
                if (lastRoute.location.pathname === pathname) {
                    junction = lastRoute as Junction
                }
                else if (lastRoute.location.pathname === pathname+'/') {
                    junction = route[route.length - 2] as Junction
                }

                if (!junction || junction.type !== 'junction') {
                    deferred.reject(undefined)
                    return
                }

                let template = junction.template as JunctionTemplate
                let children = Object.entries(template.children) as [string, Template | AsyncTemplate][]
                let possiblePagePromises = [] as Promise<Page | undefined>[]
                for (let [path, page] of children) {
                    if (page.type !== "Template" || page.templateType === "Page") {
                        possiblePagePromises.push(this.getPageNode(concatLocations({ pathname }, { pathname: path+'/' })))
                    }
                }
                Promise.all(possiblePagePromises).then(
                    possiblePages => {
                        deferred.resolve(possiblePages.filter(page => !!page) as Page[])
                    },
                    error => {
                        deferred.reject(undefined)
                    }
                )
            }
        })
        return deferred.promise
    }

    function getPageNode(location: Location): Promise<Page | undefined> {
        let deferred = new Deferred<Page | undefined>()
        this.processFinalNodeWithoutContent(location, (route?: JunctionRoute) => {
            let lastSegment = route && route[route.length - 1]
            if (!lastSegment || lastSegment.type === 'junction') {
                deferred.resolve(undefined)
            }
            else if (lastSegment.type === 'page') {
                return deferred.resolve(lastSegment)
            }
            else {
                this.getPageNode(lastSegment.to).then(deferred.resolve)
            }
        })
        return deferred.promise
    }

    function processFinalNodeWithoutContent(location: Location, callback: (route?: JunctionRoute) => void) {
        let match = matchMountedPatternAgainstLocation(this.rootMountedPattern, location)
        if (!match) {
            callback()
        }
        else {
            let deferred = new Deferred<Page | undefined>()

            const handleRouteChange = () => {
                if (!rootMatcher.isBusy()) {
                    callback(rootMatcher.getRoute())
                    rootMatcher.willUnmount()
                }
            }

            let rootMatcher = new routerConfig.rootJunctionTemplate({
                parentLocationPart: { pathname: '' },
                matchableLocationPart: location,
                mountedPattern: routerConfig.rootMountedPattern,
                onChange: handleRouteChange,
                routerConfig: this,
                shouldFetchContent: false,
            })

            handleRouteChange()
        }
    }

    return {
        getPages,
        getJunctionPages,
    }
}