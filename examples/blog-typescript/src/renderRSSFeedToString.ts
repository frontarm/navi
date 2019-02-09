import { Feed } from 'feed'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import siteMetadata from './siteMetadata'

function renderRSSFeed(siteMap) {
  let publicURL = process.env.PUBLIC_URL || '/'

  const feed = new Feed({
    title: siteMetadata.title,
    feed: '',
    feedLinks: [],
    copyright: '',
    description: siteMetadata.description,
    id: publicURL,
    // TODO: set this based on the siteMap slugs
    // updated: new Date(),
    link: publicURL,
    author: {
      name: siteMetadata.author,
    },
  })

  let pathnames = Object.keys(siteMap.pages)

  pathnames.sort().forEach(pathname => {
    let route = siteMap.pages[pathname]
    let meta = route.meta || {}
    let link = path.join(publicURL, pathname)

    // Each post's content is just an MDX component, which can be rendered
    // independently of the rest of the app.
    let content = ReactDOMServer.renderToStaticMarkup(
      React.createElement(route.content.MDXComponent),
    )

    // todo: add a date
    feed.addItem({
      title: route.title,
      id: link,
      link: link,
      date: meta.date,
      description: meta.description,
      content,
      author: [
        {
          name: siteMetadata.author,
        },
      ],
    })
  })

  return feed.rss2()
}

export default renderRSSFeed
