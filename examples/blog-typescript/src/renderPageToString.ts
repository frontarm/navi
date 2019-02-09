import { createRouter } from 'navi'
import renderReactPageToString from 'react-navi/create-react-app'
import renderRSSFeedToString from './renderRSSFeedToString'

/**
 * navi-scripts will call this function for each of your site's pages
 * to produce its statically rendered HTML.
 */
async function renderPageToString(props) {
  if (props.url.pathname === '/rss/') {
    let router = createRouter({ routes: props.routes })
    let route = await router.resolve(props.url)
    return await renderRSSFeedToString(route.data)
  }

  return renderReactPageToString(props)
}

export default renderPageToString
