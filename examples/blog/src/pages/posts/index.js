import * as Navi from 'navi'
import { sortBy } from 'lodash-es'
import slugify from 'slugify'

// Get a list of all posts, that will not be loaded until the user
// requests them.
const requirePost = require.context('.', true, /post.jsx?$/, 'lazy')
const postPathnames = requirePost.keys()
const datePattern = /^((\d{1,4})-(\d{1,4})-(\d{1,4}))[/-]/

// Create url-friendly slugs from post pathnames, and a `getPage()` function
// that can be used to load and return the post's Page object.
let posts = postPathnames.map(pathname => {
  let slug = slugify(
    pathname.replace(/post.jsx?$/, '').replace(/(\d)\/(\d)/, '$1-$2'),
  )
    .replace(/^[-.]+|[.-]+$/g, '')
    .replace(datePattern, '$1/')

  let date
  let dateMatch = slug.match(datePattern)
  if (dateMatch) {
    date = new Date(dateMatch[2], parseInt(dateMatch[3]) - 1, dateMatch[4])
  }

  return {
    pathname,
    getPage: async () => {
      let { default: post } = await requirePost(pathname)
      let { title, getContent, ...meta } = post
      return Navi.createPage({
        title,
        meta: {
          date,
          pathname,
          slug,
          ...meta,
        },
        getContent,
      })
    },
    slug,
  }
})

// Sort the pages by slug (which contain the dates)
posts = sortBy(posts, ['slug']).reverse()

export default posts
