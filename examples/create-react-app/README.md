create-react-blog
=================

A project skeleton for a blog with:

⏩ Paginated index page<br />
🏷️ Tag pages generated from the post metadata<br />
🚀 Statically generated HTML for each page<br />
🔗 Code splitting, so page content isn't loaded until it's needed<br />
📜 Smooth scrolling to hash links<br />
🔥 Page loading transition<br />
📄 MDX content<br />

And all without ejecting from create-react-app!

This project should also let you take advantage of React Suspense based routing with a single `npm upgrade navi`, as soon as soft expiration lands in React.


Getting started
---------------

After cloning, make sure you run `yarn install`:

```bash
git clone git@github.com:frontarm/navi.git
cd navi/examples/create-react-app
yarn install
yarn start
```

To statically build your site and then start a local server for testing:

```bash
yarn build
yarn serve
```


How to...
---------

### Add a blog post

Just create a directory under `src/pages/blog` that has a `page.js` and `document.md` file.

```js
// page.js
import * as React from 'react'
import * as Navi from 'navi'

export default Navi.createPage({
  title: `Your page title`,
  meta: {
    description: `Description for SEO.`,
    tags: ['some-tag'],
  },
  getContent: async () => {
    let { default: Document } = await import('!babel-loader!mdx-loader!./document.md')
    return <Document />
  }
})
```

```mdx
<!-- document.md -->

# A markdown file

You can also import and use components, as the file is compiled with mdx.
```

You can create separate directories for years/months like `2018/10/06-my-post/page.js`, or can just put the date at the beginning of the directory name, like `2018-10-06-my-post/page.js`. Either works.

In fact, you can even omit the date entirely -- and your posts will be sorted alphabetically instead of by date.

All the post loading/sorting logic takes less than 100 lines in <./src/pages/blog/index.js>. If you want to know more details on how it works, just take a look!


### Change the page size of blog index pages

Set the `PAGE_SIZE` constant in <./src/pages/blog/index.js>:

```js
const PAGE_SIZE = 10
```


### Change the available tag pages

Tag pages are generated from blog metadata, but you'll need to specify a list of available tags in <src/pages/tags/index.js>

```js
const TAGS = [
  'Navi',
  'React',
]
```

Tags are case insensitive, so you can use whatever capitalization you want the user to see.


### Handle SEO by changing your document `<head>`

The <./src/renderPageToString.js> file exports the function that is used to render each of your HTML files.

For simple changes, like adding `<meta>` tags or adding `<script>` tags to the document head, you can edit the `replaceTitle`. For example, this is where you'd put the output of [react-helmet](https://github.com/nfl/react-helmet)'s `Helmet.renderStatic()` function.

For more complex changes, take a look at the contents of the `renderCreateReactAppPageToString()` function in [react-navi](../../packages/react-navi).



### Add non-blog pages

Just use Navi.createPage, Navi.createSwitch and Navi.createRedirect. For an example, check the pages switch at <./src/pages/index.js>, and the landing page at <./src/pages/landingPage.js>.
