# Routes and Segments

## `Route`

```typescript
interface Route {
  url: URLDescriptor

  type: RouteType

  segments: Segment[]
  firstSegment: SwitchSegment
  lastSegment: Segment

  /**
   * Indicates that the router context must be changed to cause any more
   * changes.
   */
  isSteady: boolean

  /**
   * Indicates whether the location has fully loaded (including content if
   * content was requested), is still busy, or encountered an error.
   */
  status: Status

  error?: any

  title: any
  meta: any
  content: any
}
```

## `Segment` types

```typescript

/**
 * A type that covers all Segment objects.
 */
export type Segment =
  | PlaceholderSegment
  | SwitchSegment
  | PageSegment
  | RedirectSegment

export enum SegmentType {
  Placeholder = 'placeholder',
  Switch = 'switch',
  Page = 'page',
  Redirect = 'redirect',
}

/**
 * All segments extend this interface. It includes all information that can be
 * inferred from just a pattern string and a location.
 */
export interface GenericSegment {
  type: SegmentType

  /**
   * Any params that have been matched.
   */
  params: Params

  /**
   * The part of the URL pathname that has been matched.
   */
  url: URLDescriptor
}

/**
 * Placeholder segments appear at the end of a route that is still being
 * resolved.
 */
export interface PlaceholderSegment extends GenericSegment {
  type: SegmentType.Placeholder

  nextSegment?: never
  nextPattern?: never
  status: Status
  error?: any
  content?: never
  meta?: never
  title?: never

  lastRemainingSegment?: never
  remainingSegments: any[]
}

/**
 * Page segments corresponds to a URL segment followed by a final '/'.
 */
export interface PageSegment<Meta extends object = any, Content = any>
  extends GenericSegment {
  type: SegmentType.Page
  content?: Content
  meta?: Meta
  title?: string

  status: Status
  error?: never

  nextSegment?: never
  nextPattern?: never
  lastRemainingSegment?: never
  remainingSegments: any[]
}

/**
 * Redirect segments indicate that anything underneath this segment
 * should be redirected to the location specified at `to`.
 */
export interface RedirectSegment<Meta extends object = any>
  extends GenericSegment {
  to?: string
  meta: Meta
  title?: never
  type: SegmentType.Redirect

  content?: never
  status: Status
  error?: any

  nextSegment?: never
  nextPattern?: never
  lastRemainingSegment?: never
  remainingSegments: any[]
}

/**
 * Switch segments correspond to non-final segment of the URL.
 */
export interface SwitchSegment<Meta extends object = any, Content = any>
  extends GenericSegment {
  type: SegmentType.Switch
  meta: Meta
  title?: string
  switch: Switch<any, Meta, Content>

  status: Status
  error?: any
  content?: Content

  /**
   * The pattern that was matched (with param placeholders if applicable).
   */
  nextPattern?: string

  /**
   * A segment object that contains details on the next part of the URL.
   *
   * It may be undefined if the user has provided an incorrect URL, or
   * if the child's template still needs to be loaded.
   */
  nextSegment?: Segment

  /**
   * An array of all Segment objects corresponding to the remaining parts
   * of the URL.
   *
   * It may be undefined if the user has provided an incorrect URL, or
   * if the child's template still needs to be loaded.
   */
  remainingSegments: Segment[]

  /**
   * Contains the final segment object, whatever it happens to be.
   */
  lastRemainingSegment?: Segment
}
```