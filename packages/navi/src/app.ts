import { Switch } from "./Switch";

export interface AppOptions {
  exports: any,
  isBuild?: boolean,
  main: () => any,
  pages: Switch,
}

export function app(options: AppOptions) {
  // When building with navi-scripts, the `global.NaviApp` object will be
  // injected with a value of { isBuild: true }
  let global: any = window
  let app = global.NaviApp
  if (!app) {
    app = global.NaviApp = {}
  }
  Object.assign(app, options)
  if (!app.isBuild) {
    options.main()
  }
}

export function getApp(): AppOptions {
  let global: any = window
  return global.NaviApp || {}
}