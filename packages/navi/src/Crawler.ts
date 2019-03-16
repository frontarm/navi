import { NaviRequest } from './NaviRequest'
import { URLDescriptor } from './URLTools'

export interface CrawlItem {
  url: URLDescriptor

  body?: any
  headers?: { [name: string]: string }
  method?: string

  // If not supplied, context will be copied over from the parent.
  context?: any
}

export type Crawler = (
  pattern: string,
  parentRequest: NaviRequest,
) => Promise<CrawlItem[]>
