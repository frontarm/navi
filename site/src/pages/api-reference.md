API
===

## Overview

TODO

## Templates

### `createPageTemplate(options)`

Page templates are simple, they just define something that can be rendered when the user visits a URL.

#### Options

- `title` *(required)*

  The page's title, which will be set when the user navigates to the page.

- `component` *(required)*

  A component that will be used to render the page. The component will receive
  a `page` prop, with the following keys:

  * `url` - the URL at which the page was mounted
  * `title`
  * `meta`
  * `content`
  * `contentStatus`
  * `params`

- `meta` *(optional)*

  An object containing arbitrary information about the page. It's values are available as template variables within `/public/index.html`.

- `getContent()` *(optional)*

  If present, this will be called when the page is first loaded, and its result will be made available to the component under the `page.content` prop.

  You can also return a promise to the content, which makes it ideal for use with dynamic imports via `import()`. If a promise is returned, you can check whether the content is loaded by accessing `page.contentStatus`, which will have a value of `ready`, `busy` or `error`.

- `params` *(optional)*

  An array of names of URL query parameters that belong to this page.

#### Example

```js
createPageTemplate({
  title: 'React Armory',
  meta: {
    description: "Advanced React for Experienced Developers.",
  },
  component: MarkdownWrapper,
  getContent: () => import('!raw!./pitch.md'),
})
```

### createRedirectTemplate(path | (mountLocation) => path)

Redirect templates let you specify that a given path should redirect to another path.

You can either provide an absolute path, or you can provide a function that takes the path which the redirect is mounted at, and returns the path to redirect to.

#### Example

```js
// Redirect to '/new', underneath the path where the location was mounted
createRedirectTemplate((location) => path.join(location.pathname, 'new'))
```

### createJunctionTemplate(options | getOptions)

Junction Templates let you map paths to child templates.

Generally, you'll just pass this function an options object. However, if you want to perform dynamic loading of your site's components via the proposed `import()` syntax, you'll need to pass a function that returns your options, and use the supplied `split` function to wrap the promises (see the example below for details).

#### Options

- `children` *(required)*

  An object that maps URL paths to the Pages, Redirect and Junctions which
  should handle them.

  The '/' path is special; if you provide a Page or Redirect, it will be used
  when the user accesses the URL at which the junction itself is mounted.

- `component` *(required)*

  A component that will be used to render this junction.

  Generally, you can just use the `JunctionComponent` component that is
  exported from the `react-junctions` package -- see the example for details.
  
  You can also specify your own component. It will receive a `junction` prop,
  with the following keys:

  * `url` - the URL at which the junction was mounted
  * `activeChild` - a Page or Junction object that corresponds with one of the
    templates in `children`, or `undefined` if there is no matching child.
  * `activePattern` - the key of the active child within the `children` object.
  * `status` - when using dynamically loaded junctions, this indicates whether
    the junction is ready. Possible values are `ready`, `busy`, `error` or
    `notfound`.
  * `meta`
  * `params`

- `meta` *(optional)*

  Any arbitrary data that you'd like to associate with the junction.

- `params` *(optional)*

  An array of names of URL query parameters that belong to this junction.

#### Examples

##### Basic

This example has the same behavior as the example at the top; it just uses
react-junctions' `JunctionComponent` instead of a hand-rolled component.

```jsx
import { JunctionComponent } from 'react-junctions'

createJunctionTemplate({
  children: {
    '/': createRedirectTemplate('/hello'),

    '/hello': createPageTemplate({
      title: "Hello, world!",

      component: ({ page }) =>
        <div>
          <h1>{page.title}</h1>
        </div>
    })
  },

  component: JunctionComponent
})
```

##### Dynamic Loading

Here's a cut-down version of the root junction used in React Armory. It uses JavaScript's proposed `import()` syntax to dynamically load templates from other files when the user first visits a page.

```jsx
import { JunctionComponent } from 'react-junctions'

createJunctionTemplate(({ split }) => {
  children: {
    '/': split(() => import('./landing/LandingPage').then(x => x.defaut)),

    '/articles': split(() => import('./articles/ArticlesJunction').then(x => x.default)),

    '/members/login': split(() => import('./members/LoginPage').then(x => x.default)),
    '/members/logout': split(() => import('./members/LogoutPage').then(x => x.default)),
  },

  component: JunctionComponent,
})
```

#### Notes

Junction Templates shouldn't contain any content themselves; if you want to display content at the URL which a junction is mounted at, add a Page Template to the '/' path.

## Components

### <Link>

TODO

### <JunctionNavigation>

TODO

### <JunctionComponent>

TODO

### <ExitPrompt>

TODO

## Types

### Junction

### Page