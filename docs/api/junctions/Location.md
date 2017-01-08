---
title: Location
---

# Location

A type of object produced and consumed by the [history](https://github.com/mjackson/history) package, representing one state of the browser's URL and HTML5 History.

`Location` objects are plain-old JavaScript. You can create them with object literals.

## Properties

* `pathname` (*string*)
* `search` (*string*)
* `hash` (*string*)
* `state` (*object*)

## Example

```js
const myLocation = {
  // These two parts correspond to the URL
  pathname: '/contact/15/payments',
  search: '?order=date&where=paid:false'

  // This part corresponds to the HTML5 History state
  state: {

    // Junctions stores any information which cannot fit in the URL under a
    // `$$junctions` key within HTML5 History state
    $$junctions: {
      'main': { branchKey: 'AddContactModal' },
    }
  }
}
```
