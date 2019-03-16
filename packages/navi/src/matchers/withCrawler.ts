import { Crawler } from '../Crawler'
import { NaviRequest } from '../NaviRequest'

export function withCrawler(crawler: Crawler | ((crawler: Crawler, request: NaviRequest) => Crawler)) {
  // a matcher that can configure an crawler when in indexing mode
}