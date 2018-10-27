import * as Navi from 'navi'
import path from 'path'
import { chunk, fromPairs, sortBy } from 'lodash'
import slugify from 'slugify'
import { createBlogIndexPage } from './createBlogIndexPage'

// Set the number of posts that'll appear on each index page
const PAGE_SIZE = 1

// Get a list of all posts, that will not be loaded until the user
// requests them.
const requirePostPage = require.context('.', true, /page.jsx?$/, 'lazy')
const pathnames = requirePostPage.keys()

// Create url-friendly slugs from post pathnames
let posts = pathnames.map(pathname => ({
  pathname,
  slug: slugify(
    pathname.replace(/page.jsx?$/, '').replace(/(\d)\/(\d)/, '$1-$2'),
  )
    .replace(/^[-.]+|[.-]+$/g, '')
    .replace(/^(\d{1,4}-\d{1,4}-\d{1,4})-/, '$1/'),
}))

// Sort the pages by slug
posts = sortBy(posts, ['slug']).reverse()

// Generate a list of chunks of the given size
let chunks = chunk(posts, PAGE_SIZE)
let chunkPagePairs = chunks.map((chunk, i) => [
  '/' + (i + 1),
  async env => {
    // Pass in a function that can create hrefs for each index
    // page, no matter where the blog is mounted.
    let getPageHref = (pageNumber) => path.join(env.context.blogPathname, 'page', String(pageNumber))

    // Get metadata for our pages
    let posts = await Promise.all(
      chunk.map(async post => {
        let href = path.join(env.context.blogPathname, post.slug)

        return {
          href,
          route: await env.router.resolve(href, {
            // If you want to show the page content on the index page, set
            // this to true to be able to access it.
            withContent: false,
          }),
        }
      }),
    )

    return createBlogIndexPage({
      getPageHref,
      pageCount: chunks.length,
      pageNumber: i+1,
      pagePosts: posts,
    })
  },
])

export default Navi.createContext(
  env => ({
    ...env.context,
    blogPathname: env.pathname,
  }),
  Navi.createSwitch({
    paths: {
      // Put the first page at the root
      '/': chunkPagePairs.shift()[1],

      // Add the individual pages to the router tree
      ...fromPairs(
        posts.map(post => [
          '/' + post.slug,
          () => requirePostPage(post.pathname),
        ]),
      ),

      '/page': Navi.createSwitch({
        paths: {
          '/1': Navi.createRedirect(env => env.context.blogPathname),
          ...fromPairs(chunkPagePairs),
        },
      }),
    },
  }),
)
