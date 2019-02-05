import { createBrowserNavigation, createPage, createSwitch } from '../src'

describe("BrowserNavigation", () => {
  test("can be created", async () => {
    let nav = createBrowserNavigation({
      pages: createSwitch({
        paths: {
          '/test': req => createPage({ title: 'test' }),
        }
      }),
    })
  })
})