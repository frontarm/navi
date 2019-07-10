export default function register(options) {
  // When building with navi-scripts, the `window.NaviScripts` object will be
  // injected with a value of { isBuild: true }
  let app = window.NaviScripts
  if (!app) {
    app = window.NaviScripts = {}
  }
  Object.assign(app, options)
  if (!app.sharedModules) {
    app.sharedModules = {}

    try {
      app.sharedModules['react'] = require('react')
      app.sharedModules['react-navi'] = require('react-navi')
    } catch (e) {
      // Doesn't matter if React isn't available. We just want to export it if it is.
    }
  }
  if (!app.environment) {
    app.environment = process.env.NODE_ENV
  }
  if (!app.isBuild) {
    options.main()
  }
}

export function getRegistered() {
  return window.NaviScripts || {}
}
