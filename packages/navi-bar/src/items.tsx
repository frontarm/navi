import * as Navi from 'navi'

export interface SwitchItem {
  level: number
  meta: any
  children: Item[]
  url: Navi.URLDescriptor
  title?: string
  type: ItemType.Switch
}

export interface PageItem {
  level: number
  meta: any
  url: Navi.URLDescriptor
  title: string
  type: ItemType.Page
}

export type Item = PageItem | SwitchItem

export enum ItemType {
  Switch = 'switch',
  Page = 'page',
}

export function getItems(
  pageMap: Navi.PageMap,
  comparator?: (x: Item, y: Item) => -1 | 0 | 1,
): Item[] {
  let pages = Object.entries(pageMap)

  // Find the deepest switch that every page has in common
  let switchCounts = new Map<Navi.Switch, number>()
  let switchPositions = [] as Navi.Switch[]
  let deepestSwitchIndex = 0
  for (let i = 0; i < pages.length; i++) {
    let pageRoute = pages[i][1]
    let segments = pageRoute.segments.slice(0, -1) as Navi.SwitchSegment[]
    for (let j = 0; j < segments.length; j++) {
      let naviSwitch = segments[j].switch
      let nextCount = (switchCounts.get(naviSwitch) || 0) + 1
      if (j > deepestSwitchIndex) {
        deepestSwitchIndex = j
      }
      if (nextCount === pages.length) {
        // This switch has appeared in all pages, so we can add it
        switchPositions[j] = naviSwitch
      } else if (nextCount < pages.length) {
        switchCounts.set(naviSwitch, nextCount)
      }
    }
  }

  let rootSwitchIndex = switchPositions.length - 1
  let rootSwitch = switchPositions[rootSwitchIndex]
  let rootItems: Item[] = []
  let switchItems = new Map<Navi.Switch, Item[]>([[rootSwitch, rootItems]])

  // Create a tree by iterating over each segment below the root segment
  // for each route.
  for (let i = 0; i < pages.length; i++) {
    let [pathname, pageRoute] = pages[i]
    let segments = pageRoute.segments.slice(rootSwitchIndex + 1)
    let lastSwitch = rootSwitch
    for (let j = 0; j < segments.length; j++) {
      let segment = segments[j]
      if (segment.type === Navi.SegmentType.Switch) {
        let segmentSwitch = segment.switch
        if (!switchItems.has(segmentSwitch)) {
          let item: SwitchItem = {
            level: j + 1,
            meta: segment.meta,
            children: [],
            url: segment.url,
            title: segment.title,
            type: ItemType.Switch,
          }
          switchItems.get(lastSwitch)!.push(item)
          switchItems.set(segmentSwitch, item.children)
        }
        lastSwitch = segmentSwitch
      } else {
        let items = switchItems.get(lastSwitch)!
        items.push({
          level: j + 1,
          meta: segment.meta,
          url: segment.url,
          title: segment.title!,
          type: ItemType.Page,
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