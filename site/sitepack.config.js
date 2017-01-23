import path from 'path'
import { createJunction } from 'junctions'
import convertIdToKey from './utils/convertIdToKey'


export function getApplicationComponent() {
  return require('./Application').default
}


export function getRootSite() {
  return require('../SITE.js')
}


export function configurePage(page) {
  const config = {}

  if (page.contentWrapper) {
    config.contentWrapper = require('./wrappers/'+page.contentWrapper+'.js').default
  }

  if (page.indexWrapper) {
    config.indexWrapper = require('./wrappers/'+page.indexWrapper+'.js').default
  }

  if (page.index) {
    const branches = {}
    for (let i = 0, len = page.index.length; i < len; i++) {
      const childPage = page.index[i]

      const key = convertIdToKey(childPage.id)

      if (childPage !== page) {
        branches[key] = {
          default: childPage.relativePath.substr(1) == page.default,
          path: childPage.relativePath,
          next: childPage.junction || null,
          data: {
            page: childPage,
          },
        }
      }
    }
    if (Object.keys(branches).length > 0) {
      config.junction = createJunction(branches)
    }
  }

  return config
}
