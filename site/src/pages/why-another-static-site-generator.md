Why another static site generator?
==================================

Junctions allows you to build static websites with React. Of course, [Gatsby](https://www.gatsbyjs.org) already exists. So why create Junctions too?


Simplicity.
-----------

Gatsby is a remarkable undertaking. It is composed of [75 packages](https://github.com/gatsbyjs/gatsby/tree/master/packages) (at last count), and has an active community who provide more useful plugins. It has a GraphQL-based system for pulling content from anywhere. It has a detailed documentation website, and countless starter projects to choose from.

In constrast, junctions-static is a single package with eight source files. It works with create-react-app *(without ejecting!)* And it's fast, even for large sites with complex content; [React Armory](https://reactarmory.com) is based on it.


Features
--------

Junctions-static doesn't provide as many features as Gatsby. But since a junctions-static app is just a standard React app, it's easy to add what you need from the existing React and create-react-app ecosystem.

For an example, take a look at [the source](https://github.com/jamesknelson/junctions/tree/master/site) for this documentation site. Other than `react`, `react-junctions` and `junctions-static`, its only dependency is `mdx-loader` -- which is used to convert Markdown files into React components.


So which should I use?
----------------------

At the end of the day, it's really a matter of taste. But my suggestion is:

- If you're looking for a replacement for a full featured CMS, use Gatsby.
- However, if you're looking to add static rendering to a more traditional web app, or looking to roll your own CMS with static rendering, Junctions is a great start.