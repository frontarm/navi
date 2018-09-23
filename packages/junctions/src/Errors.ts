import { Location, createURL, concatLocations } from './Location'
import { MappingMatch } from './Mapping';

// See https://stackoverflow.com/questions/30402287/extended-errors-do-not-have-message-or-stack-trace
export class NaviError extends Error {
  __proto__: NaviError;

  constructor(message) {
    const trueProto = new.target.prototype;

    super(message);

    this.__proto__ = trueProto;

    if (Error.hasOwnProperty('captureStackTrace'))
        Error.captureStackTrace(this, this.constructor);
    else
       Object.defineProperty(this, 'stack', {
          value: (new Error()).stack
      });

    Object.defineProperty(this, 'message', {
      value: message
    });
  }
}

export class NotFoundError extends NaviError {
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

export class UnresolvableError extends NaviError {
  details: any

  constructor(details: any) {
    super(`Some parts of your app couldn't be loaded.`)

    this.details = details
    this.name = 'UnresolvableError'
  }
}

export class UnmanagedLocationError extends NaviError {
  location: Location

  constructor(location: Location) {
    super(`URL not managed by router: ${createURL(location)}`)
    this.location = location
    this.name = 'UnmanagedLocationError'
  }
}