import * as Navi from 'navi'
import * as React from 'react'
import { renderCreateReactAppPageToString } from 'react-navi/create-react-app'
import { getSiteMapInfo } from './getSiteMapInfo'

export async function renderPageToString({ exports, pages, siteMap, url }) {
  let navigation = Navi.createMemoryNavigation({ pages, url })

  let { route } = await navigation.getSteadyValue()
  
  return renderCreateReactAppPageToString({
    element: React.createElement(exports.App, { navigation }),
    replaceTitle: `
      <title>${route.title || 'Untitled'}</title>
      <meta name="description" content="${route.meta.description || ''}" />
      <script>
        window.siteMapInfo = ${JSON.stringify(await getSiteMapInfo({ siteMap }))}
      </script>
    `,
  })
}
