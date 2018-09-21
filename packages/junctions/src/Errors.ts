import { Location, createURL, concatLocations } from './Location'
import { MappingMatch } from './Mapping';

// See https://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax-babel
class ExtendableError extends Error {
  constructor(message) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFoundError extends ExtendableError {
  location: Location
  url: string
  match: MappingMatch

  constructor(match: MappingMatch) {
    let location = concatLocations(match.matchedLocation, match.remainingLocation!)

    super(`URL not found: ${createURL(location)}`)

    this.location = location
    this.url = createURL(location)
    this.match = match
    this.name = 'NotFoundError'
  }
}

export class UnmanagedLocationError extends ExtendableError {
  location: Location

  constructor(location: Location) {
    super(`URL not managed by router: ${createURL(location)}`)
    this.location = location
    this.name = 'UnmanagedLocationERror'
  }
}