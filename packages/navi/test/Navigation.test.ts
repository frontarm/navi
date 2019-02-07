import { createBrowserNavigation, createPage, map } from '../src'

describe("BrowserNavigation", () => {
  test("can be created", async () => {
    let nav = createBrowserNavigation({
      matcher: map({
        '/test': req => createPage({ title: 'test' }),
      }),
    })
  })
})