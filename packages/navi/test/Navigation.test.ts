import { createBrowserNavigation, route, map } from '../src'

describe("BrowserNavigation", () => {
  test("can be created", async () => {
    let nav = createBrowserNavigation({
      matcher: map({
        '/test': req => route({}),
      }),
    })
  })
})