import { sortBy } from 'lodash-es'
import slugify from 'slugify'

// Get a list of all posts, that will not be loaded until the user
// requests them.
const requirePostPage = require.context('.', true, /index.jsx?$/, 'lazy')
const postPathnames = requirePostPage
  .keys()
  .filter(pathname => pathname !== './index.js')

// Create url-friendly slugs from post pathnames, and a `getPage()` function
// that can be used to load and return the post's Page object.
let posts = postPathnames.map(pathname => ({
  pathname,
  getPage: () => requirePostPage(pathname),
  slug: slugify(
    pathname.replace(/index.jsx?$/, '').replace(/(\d)\/(\d)/, '$1-$2'),
  )
    .replace(/^[-.]+|[.-]+$/g, '')
    .replace(/^(\d{1,4}-\d{1,4}-\d{1,4})-/, '$1/'),
}))

// Sort the pages by slug (which contain the dates)
posts = sortBy(posts, ['slug']).reverse()

export default posts
