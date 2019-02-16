import { createBrowserNavigation, route, mount } from '../src'

describe("BrowserNavigation", () => {
  test("can be created", async () => {
    let nav = createBrowserNavigation({
      routes: mount({
        '/test': route({}),
      }),
    })
  })
})