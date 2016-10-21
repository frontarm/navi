# `Route`

An object of the internal type `Route`. It can be created through [createRoute](createRoute.md) or [Converter#getRouteSet](Converter.md).

## Properties

- 

## Example

```js
{
  branch: Contacts,
  data: { ... },
  params: {
    id: '15',
  },
  children: {
    main: {
      branch: PaymentList,
      data: { ... },
      params: {
        order: 'date',
        where: { paid: false },
      },
    },

    modal: {
      branch: AddContactModal,
      data: { ... },
    },
  },
}
```
