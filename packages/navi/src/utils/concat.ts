export default function concat<T>(args: (T | T[])[]): T[] {
  return [].concat.apply([], args)
}