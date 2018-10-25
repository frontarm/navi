import { Switch } from "./Switch";

export interface AppOptions {
  pages: Switch,
  exports: any,
  main: () => any,
}

export function app(options: AppOptions) {
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
