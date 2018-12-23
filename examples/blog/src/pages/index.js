import * as Navi from 'navi'
import { chunk, fromPairs } from 'lodash-es'
import posts from './posts'
import { createBlogIndexPage } from './createBlogIndexPage'

// Set the number of posts that'll appear on each index page
const PAGE_SIZE = 20

// Split the posts into a list of chunks of the given size, and
// then build index pages for each chunk.
let chunks = chunk(posts, PAGE_SIZE)
let chunkPagePairs = chunks.map((chunk, i) => [
  '/' + (i + 1),
  async env => {
    // Pass in a function that can create hrefs for each index
    // page, no matter where the blog is mounted.
    let getPageHref = (pageNumber) => '/page/'+pageNumber

    // Get metadata for our pages
    let posts = await Promise.all(
      chunk.map(async post => {
        let href = '/posts/'+post.slug

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

export default Navi.createSwitch({
  paths: {
    // Put the first page at the root
    '/': chunkPagePairs.shift()[1],

    // Add the individual pages to the router tree
    '/posts': Navi.createSwitch({
      paths: fromPairs(
        posts.map(post => [
          '/' + post.slug,
          post.getPage,
        ]),
      ),
    }),

    '/page': Navi.createSwitch({
      paths: {
        '/1': Navi.createRedirect('/'),
        ...fromPairs(chunkPagePairs),
      },
    }),

    '/tags': () => import('./tags'),
    
    '/about': () => import('./about'),
  },
})
