create-react-blog
=================

A project skeleton for a blog based on create-react-app, with:

⏩ Paginated index page<br />
🏷️ Tag pages generated from the post metadata<br />
🚀 Statically generated HTML for each page<br />
🔗 Code splitting, so page content isn't loaded until it's needed<br />
📜 Smooth scrolling to hash links<br />
🔥 Page loading transition<br />
📄 MDX content<br />


Getting started
---------------

The simplest way to get started is to use `npm init`:

```bash
npm init react-blog
cd react-blog
npm start
```

Alternatively, you can clone this repository yourself. If you take this approach, make sure to also run `yarn install`:

```bash
git clone git@github.com:frontarm/navi.git
cd navi/examples/blog
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

**To update the site's title,** edit the metadata in `src/siteMetadata.js`.

**To change the site's colors,** edit the `:root` block in `src/index.module.css`.

**To create a new post,** add a new directory to `src/pages/posts` that is prefixed with the new post's publication date, then create a `post.js` file inside it:

```jsx
export default {
  title: `Learn How To Build This Blog From Scratch`,
  tags: ['react', 'navi'],
  spoiler: "An online course with loads of live demos and exercises.",
  getContent: () => import('./document.mdx'),
}
```

**To set the maximum number of posts on an index page,**, set the `indexPageSize` property of the object exported by `src/siteMetadata.js`.

**To modify the generated HTML,** update the `src/renderPageToString.js` file.

**To add non-blog pages,** just use [`Navi.createPage()`](https://frontarm.com/navi/reference/declarations/#createpage), [`Navi.createSwitch()`](https://frontarm.com/navi/reference/declarations/#createswitch) and [`Navi.createRedirect()`](https://frontarm.com/navi/reference/declarations/#createredirect). For an example, check the about page at [src/pages/about/index.js](src/pages/about/index.js). If you create a page, remember to add it to the root switch at [src/pages/index.js](src/pages/index.js).

**To brush up on React's fundamentals,** check out the [React (without the buzzwords)](https://frontarm.com/courses/learn-raw-react/) and [Asynchronous JavaScript](https://frontarm.com/courses/async-javascript/) courses.
