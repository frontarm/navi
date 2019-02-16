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
    let chunks = pageRoute.chunks.slice(0, -1) as Navi.Chunk[]
    for (let j = 0; j < chunks.length; j++) {
      let naviSwitch = chunks[j].url.pathname
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
  let partialRoute: Navi.Route = routes[0].chunks.slice(0, rootSwitchIndex + 1).reduce(Navi.defaultRouteReducer, undefined)!
  // Create a tree by iterating over each chunk below the root chunk
  // for each route.
  for (let i = 0; i < routes.length; i++) {
    let pageRoute = routes[i]
    let chunks = pageRoute.chunks.slice(rootSwitchIndex + 1)
    let lastSwitch = rootSwitch
    let route = { ...partialRoute }
    for (let j = 0; j < chunks.length; j++) {
      let chunk = chunks[j]
      route = Navi.defaultRouteReducer(route, chunk)
      if (chunk.type === 'mount' && (chunk.patterns.length > 1 || chunk.patterns[0] !== '/')) {
        let chunkSwitch = chunk.url.pathname
        if (!switchItems.has(chunkSwitch)) {
          let item: GroupItem = {
            level: j + 1,
            data: route.data,
            children: [],
            url: chunk.url,
            title: route.title,
            type: 'group',
          }
          switchItems.get(lastSwitch)!.push(item)
          switchItems.set(chunkSwitch, item.children)
        }
        lastSwitch = chunkSwitch
      }
      else if (j === chunks.length - 1) {
        let items = switchItems.get(lastSwitch)!
        items.push({
          level: j + 1,
          data: route.data,
          url: chunk.url,
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