API
===

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

### `createRedirectTemplate(path | (mountLocation) => path)`

Redirect templates let you specify that a given path should redirect to another path.

You can either provide an absolute path, or you can provide a function that takes the path which the redirect is mounted at, and returns the path to redirect to.

#### Example

```js
// Redirect to '/new', underneath the path where the location was mounted
createRedirectTemplate((location) => path.join(location.pathname, 'new'))
```

### `createJunctionTemplate(options | getOptions)`

Junction Templates let you map paths to child templates.

Generally, you'll just pass this function an options object. However, if you want to perform dynamic loading of your site's components via the proposed `import()` syntax, you'll need to pass a function that returns your options, and use the supplied `split` function to wrap the promises (see the example below for details).

#### Options

- `children` *(required)*

  An object that maps URL paths to the Pages, Redirect and Junctions which should handle them.

  The '/' path is special; if you provide a Page or Redirect, it will be used when the user accesses the URL at which the junction itself is mounted.

- `component` *(required)*

  A component that will be used to render this junction.

  Generally, you can just use the `JunctionActiveChild` component that is exported from the `react-junctions` package -- see the example for details.
  
  You can also specify your own component. It will receive a `junction` prop, with the following keys:

  * `url` - the URL at which the junction was mounted
  * `activeChild` - a Page or Junction object that corresponds with one of the templates in `children`, or `undefined` if there is no matching child.
  * `activePattern` - the key of the active child within the `children` object.
  * `status` - when using dynamically loaded junctions, this indicates whether the junction is ready. Possible values are `ready`, `busy`, `error` or `notfound`.
  * `meta`
  * `params`

- `meta` *(optional)*

  Any arbitrary data that you'd like to associate with the junction.

- `params` *(optional)*

  An array of names of URL query parameters that belong to this junction.

#### Examples

##### Basic

This example has the same behavior as the example at the top; it just uses react-junctions' `JunctionComponent` instead of a hand-rolled component.

```jsx
import { JunctionActiveChild } from 'react-junctions'

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

  component: JunctionActiveChild
})
```

##### Dynamic Child Loading

Here's a cut-down version of the root junction used in React Armory. It uses JavaScript's proposed `import()` syntax to dynamically load templates from other files when the user first visits a page.

```jsx
import { JunctionActiveChild } from 'react-junctions'

createJunctionTemplate(({ split }) => {
  children: {
    '/': split(() =>
      import('./landing/LandingPage').then(x => x.default)
    ),

    '/articles': split(() =>
      import('./articles/ArticlesJunction').then(x => x.default)
    ),

    '/members/login': split(() =>
      import('./members/LoginPage').then(x => x.default)
    ),
    '/members/logout': split(() =>
      import('./members/LogoutPage').then(x => x.default)
    ),
  },

  component: JunctionActiveChild,
})
```

#### Notes

Junction Templates shouldn't contain any content themselves; if you want to display content at the URL which a junction is mounted at, add a Page Template to the `'/'` path.

## Components

### `<JunctionActiveChild>`

This component is a utility that renders a junction's active child, if it exists. It can be used as the `component` prop of a Junction Template.

When an active child component exists, it will render it these props:

- The `page` or `junction` prop will contain `props.junction.activeChild`
- The `env` prop will contain `props.env`

When there is no active child, it's behavior can be configured with one of the three `Element` props.

#### Props

##### `busyElement: ReactElement` <small>(optional)</small>

The element to render if the junction's `activeChild` is still unknown due to a code split.

##### `errorElement: ReactElement` <small>(optional)</small>

The element to render if the junction's `activeChild` could not be loaded due to a network error.

##### `junction: Junction` <small>(required)</small>

The junction whose active child should be rendered.

##### `notFoundElement: ReactElement` <small>(optional)</small>

The element to render if the junction has no child that matches the current URL.

### `<JunctionNavigation>`

This component contains the bulk of your application's routing code. It:

- Watches the browser history, re-rendering your app on changes
- Fetches page content, and re-renders as content status changes
- Follows redirects

The Junctions library takes a batteries-included approach, so this component also has a number of optional features enabled by default. It:

- Scrolls to `#hash` links when appropriate
- Sets the document title to the matched page's title
- Announces changes in the document title to screenreaders

These features can be configured or disabled via props if required.

#### Props

##### `annonceTitle: func | false` <small>(optional)</small>

Allows you to provide a `(title: string) => string` function that will be used to decide what to announce to screenreaders on page changes.

Alternatively, you can set a value of `false` to disable the default announcer.

##### `setDocumentTitle: func | false` <small>(optional)</small>

Allows you to provide a `(title: string) => string` function that will be used to decide the document title on page changes.

Alternatively, you can set a value of `false` to disable title management.

##### `history: History` <small>(optional)</small>

Allows you to provide a History object (as created by the [history](https://github.com/ReactTraining/history) package) that will be used to access browser history.

As react-router works with `history` objects, you can pass in react-router's `history` to allow for embedding of Junctions-based components within react-router apps.

##### `render: func` <small>(optional)</small>

Allows you to provide a custom renderer function, with the following format:

```typescript
type Renderer = (
  // An array of Junction and Page objects that correspond to the current URL
  route: (Junction | Page)[],

  // An object that can be used to access the current location, navigate
  // programatically, or find routes for arbirtrary locations.
  navigation: ()

  // The current location
  location: Location
) => React.Element
```

By default, the following render function is used:

```jsx
const defaultRender = (route, navigation, location) =>
  React.createElement(route[0].component, {
    junction: route[0],
    env: {
      navigation,
      location
    },
  })
```

##### `root: JunctionTemplate` <small>(required)</small>

The `JunctionTemplate` that defines how your app's URLs map to pages.

##### `waitForInitialContent: bool` <small>(optional)</small>

Tell Junctions to wait for your initial page's content promise to resolve before rendering any content.

Use this with the `junctions-static` build system to ensure that you don't see a loading message while the first page is loading.

### `<Link>`

This component can be used as a drop-in replacement for `<a>` tags, that re-renders your app at runtime instead of reloading the page.

#### `env` props

By default, `<Link>` will look for a `Navigation` object in its React Context. However, while easy to use, this has a number of issues. In particular, from React's [official documentation](https://reactjs.org/docs/context.html#why-not-to-use-context):

> If you want your application to be stable, don’t use context. It is an experimental API and it is likely to break in future releases of React.

Instead of using context, you can also pass your `<Link>` components an `env` prop, as output from the `<JunctionNavigation>` components's default renderer, and as used by the `<JunctionActiveChild>` component.

Explicitly passing `env` has another advantage; if an `env` prop changes, the component will re-render -- even if the component is a `PureComponent`, or has a `shouldComponentUpdate` prop. Because of this, the `<Link>` component only supports styling props like `activeClassName` and `activeStyle` when used with an `env` prop, or when used with an explicit `active` prop.

#### Props

##### `active: boolean` <small>(optional)</small>

Allows you to explicit enable or disable the `activeClassName` and `activeStyle` props.

##### `activeClassName: string` <small>(optional)</small> <small>[requires env]</small>

Will be added to your link's `className` if the app's current URL matches the `href` prop, or if the `active` prop is set to `true`.

##### `activeStyle: object` <small>(optional)</small> <small>[requires env]</small>

Will be merged into your link's `style` if the app's current URL matches the `href` prop, or if the `active` prop is set to `true`.

##### `env: { navigation, location }` <small>(recommended)</small>

An alternative approach to passing context; see the description above.

##### `exact: bool` <small>(optional)</small>

If true, the link will only be considered to "match" the current URL if it is an *exact* match.

By default, a partial match at the beginning of the current URL will also be considered a match. This facilitates nav links, which often need to be highlighted when child pages are active.

##### `href: string` <small>(required)</small>

The url to navigate to; identical to the `href` attribute of a HTML `<a>` tag.


Types
-----


### Junction

A `Junction` object is produced for each `JunctionTemplate` that maps to part of the active URL.


#### `activeChild: Junction | Page`

A Junction or Page object that contains details on the next matched part of the URL.

This may be undefined if the user has provided an incorrect URL, or if the child's template still needs to be loaded.


#### `activePattern: string`

If one of this Junction's children matches the current URL, this will contain the key from the `children` object of the matched template.


#### `activeRoute: (Junction | Page)[]`

An array of Junction and Page objects that match the remaining parts of the URL.

This may be undefined if the user has provided an incorrect URL, or if the child's template still needs to be loaded.


#### `children: JunctionTemplateChildren`

Copied from the Junction Template.


#### `component: ReactComponent`

Copied from the Junction Template.


#### `location: Location`

A Location object representing the part of the current URL that was matched to this Junction.


#### `meta: any`

Copied from the Junction Template.


#### `params: { [name: string]: any }`

A list of URL params that were matched in this Junction's path.


#### `status: 'ready' | 'busy' | 'error' | 'notfound'`

When the active child is a split junction, this string represents its current status.


#### `template: JunctionTemplate`

The `JunctionTemplate` object that was used as the basis of this Junction.


#### `type: "junction"`

A string that can be used to distinguish between `Junction` and `Page` objects.


#### `url: string`

A URL string representing the part of the current URL that was matched to this Junction.


### Page

A `Page` object is produced for the `PageTemplate` that maps to the full active URL.


#### `component: ReactComponent`

Copied from the Page Template.


#### `content: any`

Contains the value returned by the page template's `getContent` function.

If `getContent` returns a promise, this will contain the value that the promise resolves to.


#### `contentStatus: 'ready' | 'busy' | 'error'`

If the page template's `getContent` function returned a promise, this will contain the status of the promise.

If `getContent` does not exist, it will be `undefined`. Otherwise, it will contain `ready`.


#### `contentError: any`

If the page template's `getContent` function returned a promise, which was then rejected, this will contain the rejected value.


#### `location: Location`

A Location object representing the part of the current URL that was matched to this Page.


#### `meta: any`,

Copied from the Page Template.


#### `params: { [name: string]: any }`

A list of URL params that were matched in this Page's path


#### `template: PageTemplate`

The `PageTemplate` object that was used as the basis for this Page.


#### `title: string`

Copied from the Page Template.


#### `type: "page"`

A string that can be used to distinguish between `Junction` and `Page` objects.


#### `url: string`

A URL string representing the part of the current URL that was matched to this Page.