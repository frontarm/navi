# create-react-app w/ styled-components and static rendering

This example adds static rendering to a create-react-app project, complete with statically rendered critical CSS using styled-components -- ensuring that your pages render immediately, with *no* flash of unstyled content.

To try this example, you'll need to make sure that Navi is available. You can either do this by adding the required dependencies:

```bash
yarn add react react-dom navi navi-scripts react-navi
````

or by building Navi from source:

```bash
# To build from source, you'll need to install lerna globally.
yarn global add lerna

lerna bootstrap
yarn build
```

Once Navi has been added to package.json or bootstrapped from source, you'll need to change into this directory, install the dependencies, and then start the dev server or build the production version:

```bash
cd examples/styled-components-static-rendering

# Install dependencies
yarn install

# Start the dev server
yarn start

# Or build and server the production version
yarn build
yarn serve
```