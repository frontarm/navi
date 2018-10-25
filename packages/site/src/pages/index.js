import * as React from 'react'
import { createSwitch, createPage } from 'navi'
import { MDXWrapper } from '../MDXWrapper'

export default createSwitch({
  paths: {
    '/': createPage({
      title: 'Navi',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./landing.md')}
        />,
      meta: {
        socialTitle: 'Navi',
        socialDescription: 'A batteries-included router for React.',
      },
    }),

    '/api-reference': createPage({
      title: 'Navi API Reference',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./api-reference.md')}
        />,
      meta: {
        socialTitle: 'Navi API Reference',
        socialDescription: 'Complete documentation on the Navi API.',
      },
    }),

    '/static-sites-with-create-react-app': createPage({
      title: 'Static sites with create-react-app and Navi',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./static-sites-with-create-react-app.md')}
        />,
      meta: {
        socialTitle: 'Static rendering for create-react-app',
        socialDescription: "Build static HTML files for your create-react-app project, in just five steps!",
      },
    }),

    '/tutorial': createPage({
      title: 'Navi Tutorial',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./tutorial.md')}
        />,
      meta: {
        socialTitle: 'Build a static documentation site, with create-react-app and Navi',
        socialDescription: "In this step-by-step tutorial, you'll build a small documentation website with static rendering -- just like this one!",
      },
    }),

    '/why-another-router': createPage({
      title: 'Why another Router?',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./why-another-router.md')}
        />,
      meta: {
        socialTitle: 'react-router vs. Navi',
        socialDescription: "While react-router gives you the flexibility to work with native apps, Navi is laser-focused on routing for websites and web apps.",
      },
    }),

    '/why-another-static-site-generator': createPage({
      title: 'Why another Router?',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./why-another-static-site-generator.md')}
        />,
      meta: {
        socialTitle: 'Gatsby vs. Navi',
        socialDescription: "While Gatsby is infinitely configurable, Navi is designed to complement create-react-app. And it's still ridiculously fast.",
      },
    }),
  },
})
