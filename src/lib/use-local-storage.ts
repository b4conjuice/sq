import { useCallback, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    readLocalStorage(key, initialValue)
  )
  const valueRef = useRef(value)
  const setStoredValue = useCallback<Dispatch<SetStateAction<T>>>(
    nextValue => {
      const resolved =
        typeof nextValue === 'function'
          ? (nextValue as (currentValue: T) => T)(valueRef.current)
          : nextValue
      valueRef.current = resolved
      writeLocalStorage(key, resolved)
      setValue(resolved)
    },
    [key]
  )
  return [value, setStoredValue]
}
