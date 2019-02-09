import * as Navi from 'navi'

export interface GroupItem {
  level: number
  data: any
  children: Item[]
  url: Navi.URLDescriptor
  title?: string
  type: 'group'
}

export interface PageItem {
  level: number
  data: any
  url: Navi.URLDescriptor
  title: string
  type: 'page'
}

export type Item = PageItem | GroupItem

export type ItemType = 'group' | 'page'

export function getItems(
  routeMap: Navi.RouteMap,
  comparator?: (x: Item, y: Item) => -1 | 0 | 1,
): Item[] {
  let routes = Object.values(routeMap)

  // Find the deepest switch that every page has in common
  let switchCounts = new Map<string, number>()
  let switchPositions = [] as string[]
  let deepestSwitchIndex = 0
  for (let i = 0; i < routes.length; i++) {
    let pageRoute = routes[i]
    let segments = pageRoute.segments.slice(0, -1) as Navi.Segment[]
    for (let j = 0; j < segments.length; j++) {
      let naviSwitch = segments[j].url.pathname
      let nextCount = (switchCounts.get(naviSwitch) || 0) + 1
      if (j > deepestSwitchIndex) {
        deepestSwitchIndex = j
      }
      if (nextCount === routes.length) {
        // This switch has appeared in all pages, so we can add it
        switchPositions[j] = naviSwitch
      } else if (nextCount < routes.length) {
        switchCounts.set(naviSwitch, nextCount)
      }
    }
  }

  let rootSwitchIndex = switchPositions.length - 1
  let rootSwitch = switchPositions[rootSwitchIndex]
  let rootItems: Item[] = []
  let switchItems = new Map<string, Item[]>([[rootSwitch, rootItems]])
  let partialRoute: Navi.Route = routes[0].segments.slice(0, rootSwitchIndex + 1).reduce(Navi.defaultRouteReducer, undefined)!
  // Create a tree by iterating over each segment below the root segment
  // for each route.
  for (let i = 0; i < routes.length; i++) {
    let pageRoute = routes[i]
    let segments = pageRoute.segments.slice(rootSwitchIndex + 1)
    let lastSwitch = rootSwitch
    let route = { ...partialRoute }
    for (let j = 0; j < segments.length; j++) {
      let segment = segments[j]
      route = Navi.defaultRouteReducer(route, segment)
      if (segment.type === 'map' && (segment.patterns.length > 1 || segment.patterns[0] !== '/')) {
        let segmentSwitch = segment.url.pathname
        if (!switchItems.has(segmentSwitch)) {
          let item: GroupItem = {
            level: j + 1,
            data: route.data,
            children: [],
            url: segment.url,
            title: route.title,
            type: 'group',
          }
          switchItems.get(lastSwitch)!.push(item)
          switchItems.set(segmentSwitch, item.children)
        }
        lastSwitch = segmentSwitch
      }
      else if (j === segments.length - 1) {
        let items = switchItems.get(lastSwitch)!
        items.push({
          level: j + 1,
          data: route.data,
          url: segment.url,
          title: route.title!,
          type: 'page',
        })
      }
    }
  }

  // Order the items
  if (comparator) {
    let switchItemArrays = Array.from(switchItems.values())
    for (let i = 0; i < switchItemArrays.length; i++) {
      switchItemArrays[i].sort(comparator)
    }
  }

  return rootItems
}