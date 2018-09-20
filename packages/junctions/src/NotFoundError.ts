import { Location } from './Location'

export class NotFoundError {
  type: string
  unmatchedURL: string
  unmatchedLocation: Location

  constructor(options: { unmatchedLocation: Location, unmatchedURL: string }) {
    this.type = "NotFoundError"
    Object.assign(this, options)
  }
}