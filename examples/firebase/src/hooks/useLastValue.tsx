import { useEffect, useRef } from 'react'

export default function useLastValue<T>(value: T): T {
  let ref = useRef([] as any[])
  let hasChanged = ref.current[1] !== value
  useEffect(() => {
    if (hasChanged) {
      ref.current[0] = ref.current[1]
      ref.current[1] = value
    }
  })
  return hasChanged ? ref.current[1] : ref.current[0]
}