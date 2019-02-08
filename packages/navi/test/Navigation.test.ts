import { createBrowserNavigation, route, map } from '../src'

describe("BrowserNavigation", () => {
  test("can be created", async () => {
    let nav = createBrowserNavigation({
      routes: map({
        '/test': req => route({}),
      }),
    })
  })
})