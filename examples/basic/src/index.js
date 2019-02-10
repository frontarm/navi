import React from "react";
import ReactDOM from "react-dom";
import { Navi } from "react-navi";
import AppLayout from './components/AppLayout'
import "./index.css";
import routes from "./routes";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <React.Suspense fallback={<AppLayout>Loading...</AppLayout>}>
    <Navi routes={routes} />
  </React.Suspense>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();