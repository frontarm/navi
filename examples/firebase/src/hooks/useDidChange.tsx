import { useEffect, useRef } from 'react'

export default function useDidChange(value: any): boolean {
  let ref = useRef()
  let hasChanged = ref.current !== value
  useEffect(() => {
    ref.current = value
  })
  return hasChanged
}