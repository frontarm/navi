import { URLDescriptor, createURLDescriptor, joinPaths } from './URLTools'
import { RouterEnv } from './RouterEnv'

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
  pathname: string
  env: RouterEnv

  constructor(pathname: string) {
    super(`URL not found: ${pathname}`)

    this.pathname = pathname
    this.name = 'NotFoundError'
  }
}

export class OutOfRootError extends NaviError {
  url: URLDescriptor

  constructor(url: URLDescriptor) {
    super(`URL not managed by router: ${url.href}`)
    this.url = url
    this.name = 'UnmanagedLocationError'
  }
}