# `<Form method>` handling

This example just gives you a `<Form>` component that works both with and without JavaScript (or at least it would if the example included a server).

The `<Form>` component processes results client-side by calling `navigation.navigate({ method })`, with the route handler performing the actual work. When JavaScript is disabled, it falls back to use a standard POST request -- which you could handle with the same code on the server side.

To try it, change into this directory, install the dependencies, and then start the dev server or build the production version:

```
cd basic

# Install dependencies
npm install

# Start the dev server
npm start

# Build the production version
npm run build
```