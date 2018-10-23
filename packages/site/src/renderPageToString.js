import * as React from 'react'
import { createMemoryNavigation } from 'navi'
import { renderCreateReactAppPageToString } from 'react-navi/create-react-app'

export async function renderPageToString({ $exports, url, dependencies, config }) {
  let navigation = createMemoryNavigation({ url, rootSwitch: $exports.rootSwitch })
  
  let { route } = await navigation.getSteadySnapshot()
  let { title, meta } = route

  return renderCreateReactAppPageToString({
    config,
    replaceTitle: `
      <title>${title || 'Untitled'}</title>

      <meta property="og:title" content="${meta.socialTitle || title}" />
      <meta name="twitter:title" content="${meta.socialTitle || title}" />
      <meta name="description" content="${meta.description || ''}" />
      <meta property="og:description" content="${meta.socialDescription || meta.description || ''}" />
      <meta name="twitter:description" content="${meta.socialDescription || meta.description || ''}" />
    `,
    dependencies,
    element: React.createElement($exports.App, {navigation})
  })
}
