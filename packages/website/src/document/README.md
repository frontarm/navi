@frontarm/document
==================

A set of components for creating rich, responsive documents built around MDX.


Main Components
---------------

### `<Document>`

Expects an MDX component as its `Component` prop.

Like MDX components, the components that are used to render each type of Document component can be configured, either by passing in a `components` object to your `<Document>` component, or by using a `<DocumentProvider>` component.

#### `props

- `Component`

  The MDX Document component to render.

- `documentProps?: DocumentProps`

  Props that will be passed through to the rendered Document Component

- `demoboardHelpers?: { [name: string]: string }`

  Helper files that will be available to all inline demoboards

- `canAccessRestrictedContent?: boolean`

  If true, any editors/videos with the `isRestricted` attribute will be usable

- `isStatic?: boolean`

  If true, any nested `<HideWhenStatic>` blocks will not be shown.


### `<DocumentProvider components children>`

Merges in default values for the `components` object of any child `<Component>` elements.


Content Components
------------------

### `<Beware children title="Beware">`

Indicates content that helps the reader from hurting themselves or losing a large amount of time.

Assumes placement within the left column.

### `<Demoboard ...>`

Renders an inline demoboard.

#### `props`

- `persistenceKey`

  If present, any changes will be saved for each user, and loaded when the user navigates back to the page. This key will not be visible to the user, and should be unique across the entire site. It should follow the format `path#keyWithinPage`. A warning will be logged if the path doesn't map to the current path, or if multiple keys are used on the same page.

- `restricted`

  If true, readers won't be able to use the demoboard unless `canAccessRestrictedContent` is also passed to the parent `<Document>` element.

- `sources`

  Accepts a list of sources, with magic sources prefixed by `magic:`, and solution sources prefixed by `solution:`.

  *Future plan: create a loader that allows an entire directory to be smashed in here with a single `require()`...*

- `theme?: "dark" | "light"`

- `maximizeLeftPanel?: boolean`: *defaults to `true`*
- `maximizeRightPanel?: boolean`: *defaults to `false`*
- `leftPanel?: 'transformedSource' | 'solutionSource'`
- `lineCount?: number`
- `rightPanel?: 'console'`
- `tab?: 'editor' | 'viewer'`

### `<Details children title=null>`

Can be placed in either the left or right columns.

### `<Spoiler children title="Spoiler">`

Assumes placement within the left column.

### `<Tangent children title=null>`

Assumes placement within the right column.

### `<Video ...>`

Can be placed anywhere; the left column, right column, both columns or full width are all allowable.

#### `props`

- `TODO`

- `restricted`

  If true, readers won't be able to use the demoboard unless `canAccessRestrictedContent` is also passed to the parent `<Document>` element.


Layout Components
-----------------

Layout components are not configurable

### `<Document.AsideOrAfter aside children>`

Renders the `aside` element on the right of `children` if there's space, but when collpasing to a single column, renders the `aside` element underneath `children`.

### `<Document.LeftBlock children>`

Renders a block of content in the left column.

### `<Document.FloatRight children>`

Floats a block of content right of the following columns, similar to how floats in CSS work.

### `<Document.FullBlock children>`

Renders a block of content that takes the full width of the `<Document>` component, allowing you to choose your own margins.

### `<Document.DoubleBlock children>`

Renders a block of content that takes up the width of both columns, if they're available.


Conditional Rendering Components
--------------------------------

### `<Document.HideWhenStatic children>`

Hides its children when the document is being statically built -- useful for parts of the document that vary between guest and pro members.

### `<Document.Restricted restricted? children>`

Show the children only when the viewer has full access to the document. If the viewer doesn't have full access, show the `restricted` element instead.


Code blocks
-----------

When Markdown code blocks begin with the line `//---`, they'll be turned into `<Document.Demoboard>` elements. Otherwise, they'll be treated as code listings, which are rendered with the standard `codeBlock` component.

Demoboard code blocks will be split into sections denoted by `//---`. The first section contains configuration that will be passed as props to the `<Document.Demoboard>` component. The following sections will be treated differently depending on how they start:

- `--- filename`

  Treats the following lines as a source file with the specified filename

- `-- solution:filename`

  Treats the following lines as a solution for the specified filename

- `--- magic:filename`

  Treats the following lines as a magic file with the specified filename

- `... <-- helperFilename`

  Creates a file, solution or magic file from the helper with the given name.

### Example

```jsx
//---
// name: "Demoboard name"
// description: "Some description about this demoboard"
// isRestricted: true // if true, this will be hidden unless 
// defaultRightPanel: "console"
// consoleIsMaximized: false
// defaultViewerURL: ''
//--- main.js
const isDone = false
//--- helper:main.js
const isDone = true
//--- magic:package.json
{
  name: "magicFile",
  description: "built but not displayed in tabs"
}
//--- styles.css <-- styles-a.css
.test {
  /**
   * Helpers allow files to be shared between demoboards
   */
}
```

Note that while this inline syntax is great for small, quick examples, for bigger examples you might find it easier to manually add a `<Document.Demoboard>` element.


`components` object
-------------------

The `components` object can be passed to an individual `<Document>`, or can be passed to a `<DocumentProvider>` to set the default components for all child documents. It supports all MDX compnents, along with a number of document-specific components.

- `<wrapper>`

  Like the MDX `wrapper` component, but also receives any `className`, `style` and `id` that were passed to the `<Document>` element itself.

- `<headingLink href>`

  A link within heading elements that points to the heading itself.


### Content components

- `Beware`
- `Demoboard`: *also includes a `hasAccess` boolean*
- `Details`
- `Spoiler`
- `Tangent`
- `Video`: *also includes a `hasAccess` boolean*

### Layout components

- `AsideOrAfter`
- `LeftBlock`
- `FloatRight`
- `FullBlock`
- `DoubleBlock`
