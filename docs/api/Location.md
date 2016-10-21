# Location

An object produced and consumed by the [history](https://github.com/mjackson/history) package, representing one state of the browser's URL and HTML5 History `state.

## Example

```js
{
  // These two parts correspond to the URL
  pathname: '/contact/15/payments',
  search: '?order=date&where=paid:false'

  // This part corresponds to the HTML5 History state
  state: {
    $$junctions: {
      'main': { branchKey: 'AddContactModal' },
    }
  }
}
```
