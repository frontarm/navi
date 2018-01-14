Why another static site generator?
==================================

Junctions allows you to build static websites with React. Of course, [Gatsby](https://www.gatsbyjs.org) already exists. So why would you use Junctions?


Simplicity.
-----------

Gatsby is incredible, and it is *fast*. It is also enormous. It has:

- [75 packages](https://github.com/gatsbyjs/gatsby/tree/master/packages) (at last count), and an active community who are building more.
- A configurable build system.
- A GraphQL-based system for pulling content from anywhere.
- Countless starter projects to choose from.

In contrast, Junctions is *just as fast* as Gatsby. But it is simple. It:

- Has only [3 packages](https://github.com/jamesknelson/junctions/tree/master/packages).
- Uses create-react-app for zero-configuration builds.
- Let's you define custom routes.
- Can be added to a blank create-react-app project in [4 short steps](/static-sites-with-create-react-app).


Features
--------

Junctions-static doesn't provide as many features as Gatsby. But since a junctions-static app is just a standard React app, it's easy to add what you need from the existing React and create-react-app ecosystem.

For an example, take a look at [the source](https://github.com/jamesknelson/junctions/tree/master/site) for this documentation site. It has only *two* dependencies other than React and Junctions: [mdxc](https://github.com/jamesknelson/mdxc), and `mdx-loader`, which are used to convert Markdown into React components.


So which should I use?
----------------------

At the end of the day, it's really a matter of taste. But my suggestion is:

- If you're looking for a replacement for a full featured CMS, use Gatsby.
- If you want to add static rendering to a more traditional web app, are looking to roll your own CMS, or just need a small documentation website, then Junctions is a great start.


[Tutorial: Make a small documentation site &raquo;](/tutorial)