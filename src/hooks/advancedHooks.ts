import { useEffect, useRef } from 'react'

export function useEffectLog(tag: string) {
  useEffect(() => {
    console.log('[do effect]', tag)
    return () => {
      console.log('[clean effect]', tag)
    }
  })
}

interface ResultBox<T> {
  v: T
}

/**
 * 创建一个不变的常量，通常用于包装一个 Observable 保证其引用不变
 * @param fn
 */
export function useConst<T>(fn: () => T): T {
  const ref = useRef<ResultBox<T>>()

  if (!ref.current) {
    ref.current = { v: fn() }
  }

  return ref.current.v
}

export function usePrevious<T>(value: T): T {
  const ref = useRef<T>(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
