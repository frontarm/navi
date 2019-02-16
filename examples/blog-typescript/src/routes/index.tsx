import { compose, lazy, map, mount, redirect, route, withContext, withView, Route } from 'navi'
import React from 'react'
import { join } from 'path'
import { chunk, fromPairs } from 'lodash'
import BlogIndexPage from '../components/BlogIndexPage'
import BlogLayout from '../components/BlogLayout'
import BlogPostLayout from '../components/BlogPostLayout'
import siteMetadata from '../siteMetadata'
import posts from './posts'

interface AppNavContext {
  blogRoot: string
}

// Split the posts into a list of chunks of the given size, and
// then build index pages for each chunk.
let chunks = chunk(posts, siteMetadata.indexPageSize)
let chunkPagePairs = chunks.map((chunk, i) => [
  '/' + (i + 1),
  map(async (req, context: AppNavContext) => {
    // Get metadata for all pages on this page
    let postRoutes = await Promise.all<Route>(
      chunk.map(async post => {
        let href = join(context.blogRoot, 'posts', post.slug)
        return await req.router.resolve(href, {
          // If you want to show the page content on the index page, set
          // this to 'GET' to be able to access it.
          method: 'HEAD',
        })
      }),
    )

    // Only add a page number to the page title after the first index page.
    let pageTitle = siteMetadata.title
    if (i > 0) {
      pageTitle += ` – page ${i + 1}`
    }

    return route({
      title: pageTitle,
      getView: () => (
        <BlogIndexPage
          blogRoot={context.blogRoot}
          pageNumber={i + 1}
          pageCount={chunks.length}
          postRoutes={postRoutes}
        />
      ),
    })
  }),
])

const pagesSwitch = compose(
  withContext((req): AppNavContext => ({
    // By adding the point at which the blog was mounted to context, it
    // makes it possible to easily scope all URLs to the blog root, thus
    // making it possible to mount the entire route on a subdirectory.
    blogRoot: req.mountpath || '/',
  })),
  withView((req, context) => {
    // Check if the current page is an index page by comparing the remaining
    // portion of the URL's pathname with the index page paths.
    let isViewingIndex = req.path === '/' || /^\/page\/\d+\/$/.test(req.path)

    // Wrap the current page's content with a React Context to pass global
    // configuration to the blog's components.
    return (
      <BlogLayout
        blogRoot={context.blogRoot}
        isViewingIndex={isViewingIndex}
      />
    )
  }),
  mount({
    // The blog's index pages go here. The first index page is mapped to the
    // root URL, with a redirect from "/page/1". Subsequent index pages are
    // mapped to "/page/n".
    '/': chunkPagePairs.shift()[1],
    '/page': mount({
      '/1': redirect((req, context: AppNavContext) => context.blogRoot),
      ...fromPairs(chunkPagePairs),
    }),

    // Put posts under "/posts", so that they can be wrapped with a
    // "<BlogPostLayout />" that configures MDX and adds a post-specific layout.
    '/posts': compose(
      withView((req, context: AppNavContext) => <BlogPostLayout blogRoot={context.blogRoot} />),
      mount(fromPairs(posts.map(post => ['/' + post.slug, post.getPage]))),
    ),

    // Miscellaneous pages can be added directly to the root switch.
    '/tags': lazy(() => import('./tags')),
    '/about': lazy(() => import('./about')),

    // Only the statically built copy of the RSS feed is intended to be opened,
    // but the content is fetched here.
    '/rss': route({
      getData: req => req.router.resolveSiteMap('/posts', { method: 'GET' }),
    }),
  }),
)

export default pagesSwitch
