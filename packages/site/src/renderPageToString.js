import * as Navi from 'navi'
import * as React from 'react'
import { renderCreateReactAppPageToString } from 'react-navi/create-react-app'

export async function renderPageToString({ exports, pages, url }) {
  let navigation = Navi.createMemoryNavigation({ pages, url })

  let { route } = await navigation.getSteadyValue()
  
  return renderCreateReactAppPageToString({
    element: React.createElement(exports.App, { navigation }),
    replaceTitle: `
      <title>${route.title || 'Untitled'}</title>

      <meta property="og:title" content="${route.meta.socialTitle || route.title}" />
      <meta name="twitter:title" content="${route.meta.socialTitle || route.title}" />
      <meta name="description" content="${route.meta.description || ''}" />
      <meta property="og:description" content="${route.meta.socialDescription || route.meta.description || ''}" />
      <meta name="twitter:description" content="${route.meta.socialDescription || route.meta.description || ''}" />
    `,
  })
}
