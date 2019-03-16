import { Crawler, CrawlItem } from './Crawler'
import { Matcher } from './Matcher'
import { NaviRequest } from './NaviRequest'
import { createPromiseFromObservable } from './Observable'
import { createRouter } from './Router'
import { createURLDescriptor, URLDescriptor, join } from './URLTools'

export interface CrawlOptions<Context extends object = any> {
  routes: Matcher<Context>

  /**
   * If provided, this part of any URLs will be ignored. This is useful
   * for mounting a Navi app in a subdirectory on a domain.
   */
  basename?: string

  context?: Context

  /**
   * The bottom-most URL that should be crawled.
   */
  root?: string | URLDescriptor

  predicate?: (request: CrawlItem) => boolean
  expandPattern?: (
    pattern: string,
  ) => undefined | string[] | Promise<undefined | string[]>
  headers?: { [name: string]: string }
  hostname?: string
}

export interface CrawlResult {
  paths: string[]
  redirects: {
    [name: string]: string
  }
}

export async function crawl(options: CrawlOptions): Promise<CrawlResult> {
  let router = createRouter({
    basename: options.basename,
    context: options.context,
    routes: options.routes,
  })
  let url = createURLDescriptor(options.root || '')
  let predicate = options.predicate || (() => true)
  let expandPattern =
    options.expandPattern || ((pattern: string) => [pattern || ''])

  let crawler: Crawler = async (
    pattern: string,
    parentRequest: NaviRequest,
  ) => {
    let patterns = (await expandPattern(pattern)) || []
    return patterns
      .map(pattern => ({
        headers: parentRequest.headers,
        url: createURLDescriptor(join(parentRequest.mountpath, pattern)),
        context: parentRequest.headers,
      }))
      .filter(predicate)
  }

  let chunkListObservable = router.createObservable(url, {
    crawler,
    headers: options.headers,
  })
  let chunkList = await createPromiseFromObservable(chunkListObservable!)

  // Build a list of pages and redirects from the list of chunks
  let paths = new Set<string>()
  let redirects: { [name: string]: string } = {}
  chunk:
  for (let i = 0; i < chunkList.length; i++) {
    let chunk = chunkList[i]
    if (chunk.type === 'crawl') {
      let pathname = chunk.url.pathname
      if (pathname.indexOf(':') !== -1) {
        continue
      }
      for (let j = i+1; j < chunkList.length; j++, i++) {
        let subChunk = chunkList[j]
        if (subChunk.type === 'crawl' || subChunk.type === 'mount') {
          break
        }
        if (subChunk.type === 'redirect') {
          redirects[pathname] = subChunk.to
          continue chunk
        }
      }
      paths.add(pathname)
    }
  }

  return {
    paths: Array.from(paths),
    redirects,
  }
}
