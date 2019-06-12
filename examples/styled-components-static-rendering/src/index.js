import register from "navi-scripts/register";
import { createBrowserNavigation } from "navi";
import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-navi";
import {
  ServerStyleSheet,
  __DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_SPOOKY_GHOSTS as scSecrets,
} from 'styled-components/macro';
import routes from "./routes";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

// `register()` is responsible for exporting your app's pages and App
// component to the static renderer, and for starting the app with the
// `main()` function when running within a browser.
register({
  // Specify the pages that navi-app should statically build, by passing in a
  // Switch object.
  routes,

  // The default create-react-app renderer needs access to the App component.
  // Learn about custom static renderers at:
  // https://frontarm.com/navi/guides/static-rendering/
  exports: {
    App,

    // Because Navi's static renderer loads the bundled code in JSDOM, it can't
    // access the same copy of styled-components unless it is exported here.
    // Because ServerStyleSheet uses context internally, the same copy of
    // styled-components needs to be used for statically rendered styles to
    // work.
    StyleSheet: scSecrets.StyleSheet,
    ServerStyleSheet,
  },

  // This will only be called when loading your app in the browser. It won't
  // be called when performing static generation.
  async main() {
    let navigation = createBrowserNavigation({
      routes,
    });

    // Wait until the navigation has loaded the page's content, or failed to do
    // so. If you want to load other data in parallel while the initial page is
    // loading, make sure to start loading before this line.
    await navigation.getRoute();

    // React requires that you call `ReactDOM.hydrate` if there is statically
    // rendered content in the root element, but prefers us to call
    // `ReactDOM.render` when it is empty.
    let hasStaticContent = process.env.NODE_ENV === "production";
    let renderer = hasStaticContent ? ReactDOM.hydrate : ReactDOM.render;

    // Start react.
    renderer(
      <Router hashScrollBehavior='smooth' navigation={navigation}>
        <App />
      </Router>,
      document.getElementById("root")
    );

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: http://bit.ly/CRA-PWA
    serviceWorker.unregister();
  }
});
