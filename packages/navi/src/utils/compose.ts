// Copyright (c) 2015-present Dan Abramov
// The MIT License (MIT)
// See: https://github.com/reduxjs/redux/blob/d53364c44b2fb75b59e2c98090b253c103d63c75/index.d.ts

type Func0<R> = (() => R)
type Func1<T1, R> = ((a1: T1) => R)

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for the
 * resulting composite function.
 *
 * @param funcs The functions to compose.
 * @returns R function obtained by composing the argument functions from right
 *   to left. For example, `compose(f, g, h)` is identical to doing
 *   `(...args) => f(g(h(...args)))`.
 */
export function compose<F extends Function>(f: F): F

/* two functions */
export function compose<A, R>(f1: (b: A) => R, f2: Func0<A>): Func0<R>
export function compose<A, T1, R>(
  f1: (x: A) => R,
  f2: Func1<T1, A>
): Func1<T1, R>

/* three functions */
export function compose<A, B, R>(
  f1: (x: B) => R,
  f2: (x: A) => B,
  f3: Func0<A>
): Func0<R>
export function compose<A, B, T1, R>(
  f1: (x: B) => R,
  f2: (x: A) => B,
  f3: Func1<T1, A>
): Func1<T1, R>

/* four functions */
export function compose<A, B, C, R>(
  f1: (x: C) => R,
  f2: (x: B) => C,
  f3: (x: A) => B,
  f4: Func0<A>
): Func0<R>
export function compose<A, B, C, T1, R>(
  f1: (x: C) => R,
  f2: (x: B) => C,
  f3: (x: A) => B,
  f4: Func1<T1, A>
): Func1<T1, R>

/* five functions */
export function compose<A, B, C, D, R>(
  f1: (x: D) => R,
  f2: (x: C) => D,
  f3: (x: B) => C,
  f4: (x: A) => B,
  f5: Func0<A>
): Func0<R>
export function compose<A, B, C, D, T1, R>(
  f1: (x: D) => R,
  f2: (x: C) => D,
  f3: (x: B) => C,
  f4: (x: A) => B,
  f5: Func1<T1, A>
): Func1<T1, R>

/* six functions */
export function compose<A, B, C, D, E, R>(
  f1: (x: E) => R,
  f2: (x: D) => E,
  f3: (x: C) => D,
  f4: (x: B) => C,
  f5: (x: A) => B,
  f6: Func0<A>
): Func0<R>
export function compose<A, B, C, D, E, T1, R>(
  f1: (x: E) => R,
  f2: (x: D) => E,
  f3: (x: C) => D,
  f4: (x: B) => C,
  f5: (x: A) => B,
  f6: Func1<T1, A>
): Func1<T1, R>

/* seven functions */
export function compose<A, B, C, D, E, F, R>(
  f1: (x: F) => R,
  f2: (x: E) => F,
  f3: (x: D) => E,
  f4: (x: C) => D,
  f5: (x: B) => C,
  f6: (x: A) => B,
  f7: Func0<A>
): Func0<R>
export function compose<A, B, C, D, E, F, T1, R>(
  f1: (x: F) => R,
  f2: (x: E) => F,
  f3: (x: D) => E,
  f4: (x: C) => D,
  f5: (x: B) => C,
  f6: (x: A) => B,
  f7: Func1<T1, A>
): Func1<T1, R>

/* eight functions */
export function compose<A, B, C, D, E, F, G, R>(
  f1: (x: G) => R,
  f2: (x: F) => G,
  f3: (x: E) => F,
  f4: (x: D) => E,
  f5: (x: C) => D,
  f6: (x: B) => C,
  f7: (x: A) => B,
  f8: Func0<A>
): Func0<R>
export function compose<A, B, C, D, E, F, G, T1, R>(
  f1: (x: G) => R,
  f2: (x: F) => G,
  f3: (x: E) => F,
  f4: (x: D) => E,
  f5: (x: C) => D,
  f6: (x: B) => C,
  f7: (x: A) => B,
  f8: Func1<T1, A>
): Func1<T1, R>

/* eight functions */
export function compose<A, B, C, D, E, F, G, H, R>(
  f1: (x: H) => R,
  f2: (x: G) => H,
  f3: (x: F) => G,
  f4: (x: E) => F,
  f5: (x: D) => E,
  f6: (x: C) => D,
  f7: (x: B) => C,
  f8: (x: A) => B,
  f9: Func0<A>
): Func0<R>
export function compose<A, B, C, D, E, F, G, H, T1, R>(
  f1: (x: H) => R,
  f2: (x: G) => H,
  f3: (x: F) => G,
  f4: (x: E) => F,
  f5: (x: D) => E,
  f6: (x: C) => D,
  f7: (x: B) => C,
  f8: (x: A) => B,
  f9: Func1<T1, A>
): Func1<T1, R>

/* rest */
export function compose<R>(
  f1: (b: any) => R,
  ...funcs: Function[]
): ((...args: any[]) => R)

export function compose<R>(...funcs: Function[]): ((...args: any[]) => R)

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
export function compose(...funcs) {
  if (funcs.length === 0) {
    throw new Error('composeMatchers() expects at least one matcher.')
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}