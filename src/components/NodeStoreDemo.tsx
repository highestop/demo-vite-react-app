import { useObservableState } from 'observable-hooks'
import React from 'react'
import { Subject, Observable } from 'rxjs'

class NodeStore {
  private store = new Map<string, number>([])

  private operation: { key: string; value: number }[] = []

  private requested = false

  private notify$$ = new Subject<{ key: string; value: number }[]>()

  public get notify$(): Observable<{ key: string; value: number }[]> {
    return this.notify$$.asObservable()
  }

  public insert(key: string, value: number) {
    console.log('[action] insert', key, value)
    this.store.set(key, value)
    this.operation.push({ key, value })
    this.requestNotify()
  }

  private requestNotify() {
    if (!this.requested) {
      this.requested = true
      queueMicrotask(() => {
        console.log('[reducer] request notify')
        this.notify$$.next([...this.operation])
        this.operation.length = 0
        this.requested = false
      })
    }
  }
}

const store = new NodeStore()

store.insert('a', 0)

store.notify$.subscribe(changes => {
  console.warn('[subscribe]', changes)
})

setTimeout(() => {
  console.warn('[nextMacroTask]')
}, 0)

function StoreApp() {
  const changes = useObservableState(store.notify$, [])
  React.useEffect(() => {
    console.warn('[after] app')
    store.insert('b', 1)
    return () => {
      store.insert('c', 2)
      console.warn('[clean] app')
    }
  }, [])
  console.log('[render] app', changes)
  return (
    <div>
      {changes.map(change => (
        <div key={change.key}>
          {change.key}: {change.value}
        </div>
      ))}
    </div>
  )
}

export function App() {
  const changes = useObservableState(store.notify$, [])
  const flag = React.useMemo(() => {
    console.log('[memo]', changes)
    return !changes.length || (changes.length > 0 && changes[0].key === 'a')
  }, [changes])
  React.useEffect(() => {
    console.warn('[after] root')
  }, [])
  console.log('[render] root', changes)
  return flag ? <StoreApp></StoreApp> : null
}
