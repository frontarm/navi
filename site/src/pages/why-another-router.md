import {} from './why-another-router.css'

Why another router?
===================

Junctions is a router for React. But of course, [react-router](https://reacttraining.com/react-router/) already exists. So why build another?


A difference in philosophy
--------------------------

Junctions is laser-focused on providing the best routing experience *for the web*. It was designed to provide fast, accessible routing for large web applications with publicly accessible content. This philosophy stems from its use as the build system for [React Armory](https://reactarmory.com).

In comparison, react-router is focused on providing routing *for any React application*. These applications may be web apps, native apps, or even VR apps. As a result, react-router is more limited in its web-focused features, but does provide better support for Android and iPhone apps.


Features
--------

If you're building a web app, Junctions provides a number of features that you'd need to implement manually with react-router.

If you're building an iPhone or Android app, you can still use Junctions; but react-router gives you more of a head start.

<table className='features-table'>
<tbody>
<tr>
<th></th>
<th className="junctions">Junctions</th>
<th className="react-router">react-router</th>
</tr>
<tr>
<th>Scroll management</th>
<td className="yes"></td>
<td></td>
</tr>
<tr>
<th>Page title management</th>
<td className="yes"></td>
<td></td>
</tr>
<tr>
<th>Static rendering with code splitting</th>
<td className="yes"></td>
<td></td>
</tr>
<tr>
<th>Ready-made native components</th>
<td></td>
<td className="yes"></td>
</tr>
</tbody>
</table>


Static rendering with code splitting
------------------------------------

In particular, Junctions makes it ridiculously easy to add code splits, even with static or server-side rendering.

This is invaluable for large web apps and websites:

- Without code splitting, you'll soon run into problems with huge JavaScript bundles, slowing initial response times and severely degrading mobile user's experience.
- Without static rendering, your app's JavaScript needs to be downloaded and parsed before your users see anything, and you'll have no control over how your pages appear when shared via social media.

React-router's [documentation](https://reacttraining.com/react-router/web/guides/code-splitting) makes a point of saying it won't support both of these:

> We determined that google was indexing our sites well enough for our needs without server rendering, so we dropped it in favor of code-splitting + service worker caching. Godspeed those who attempt the server-rendered, code-split apps.

With Junctions, all it takes to statically render code splits is a `create-react-app` project, and the ESNext `import()` proposal.

In fact, the page you're reading now uses static rendering with code splitting. Here's what it looks like:

```jsx
export const AppJunctionTemplate = createJunctionTemplate({
    children: {
        '/why-another-router': createPageTemplate({
            title: 'Why another Router?',
            component: MDXWrapper,
            getContent: () =>
                import('!babel-loader!mdx-loader!./pages/why-another-router.md'),
            meta: {
                socialTitle: 'react-router vs. Junctions',
                socialDescription:
                    "While react-router gives you the flexibility to work with "+
                    "native apps, Junctions is laser-focused on routing for "+
                    "websites and web apps.",
            },
        }),
    }
})
```

Neat. But why build websites with Junction when you could use Gatsby?

[Do we really need another static site generator? &raquo;](/why-another-static-site-generator)
