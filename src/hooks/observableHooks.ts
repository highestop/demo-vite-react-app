import { isEqual } from 'lodash-es'
import {
  pluckFirst,
  useObservable,
  useObservableCallback,
  useRefFn,
  useSubscription
} from 'observable-hooks'
import type { useSubscription as useSubscriptionType } from 'observable-hooks'
import { useDebugValue, useEffect, useRef, useState } from 'react'
import {
  BehaviorSubject,
  distinctUntilChanged,
  isObservable,
  Observable,
  startWith,
  Subject,
  tap
} from 'rxjs'

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

/**
 * 维护一个 destroyed Subject 状态流，会在 hook clean 时结束
 */
export function useDestroyed$(): Subject<void> {
  const destroyed$ = useConst(() => new Subject<void>())
  useEffect(() => {
    return () => {
      destroyed$.next()
      destroyed$.complete()
    }
  }, [destroyed$])
  return destroyed$
}

/**
 * 创建一个 Observable 并带有初始值
 * @param initValue
 */
export function useObservableCallbackWithInit<T>(initValue: T) {
  return useObservableCallback(startWith<T>(initValue))
}

/**
 * 若深比较 inputValue 的值发生变化，则输出新的值
 * 使用场景通常是当 inputValue 为 object 引用类型，若为 String、Number 等基本类型（可以浅比较的类型），可直接用 useObservable
 * @param value
 */
export function useValueObservable<T>(value: T): Observable<T> {
  return useObservable(pluckFirst, [value]).pipe(distinctUntilChanged(isEqual))
}

export function useMarkedObservableState<TState>(
  flag: string,
  input$: BehaviorSubject<TState>
): TState
export function useMarkedObservableState<TState>(
  flag: string,
  input$: Observable<TState>
): TState | undefined
export function useMarkedObservableState<TState>(
  flag: string,
  input$: Observable<TState>,
  initialState: TState | (() => TState)
): TState
export function useMarkedObservableState<TState, TInput = TState>(
  flag: string,
  init: (input$: Observable<TInput>) => Observable<TState>
): [TState | undefined, (input: TInput) => void]
export function useMarkedObservableState<TState, TInput = TState>(
  flag: string,
  init: (
    input$: Observable<TInput>,
    initialState: TState
  ) => Observable<TState>,
  initialState: TState | (() => TState)
): [TState, (input: TInput) => void]
export function useMarkedObservableState<TState, TInput = TState>(
  flag: string,
  state$OrInit:
    | Observable<TState>
    | ((
        input$: Observable<TInput>,
        initialState?: TState
      ) => Observable<TState>),
  initialState?: TState | (() => TState)
): TState | undefined | [TState | undefined, (input: TInput) => void] {
  return useMarkedObservableStateInternal(
    flag,
    useSubscription,
    state$OrInit,
    initialState
  )
}

const traceFn = (token: string, key?: any) => console.debug(token, key)

const trace = <T>(flag: string) => tap<T>(() => traceFn('rxjs.subscribe', flag))

export function useMarkedObservableStateInternal<TState, TInput = TState>(
  flag: string,
  useSubscription: typeof useSubscriptionType,
  state$OrInit:
    | Observable<TState>
    | ((
        input$: Observable<TInput>,
        initialState?: TState
      ) => Observable<TState>),
  initialState?: TState | (() => TState)
): TState | undefined | [TState | undefined, (input: TInput) => void] {
  useEffect(() => {
    traceFn('rxjs.subscription.create')
    return () => {
      traceFn('rxjs.subscription.remove')
    }
  }, [])

  // Even though hooks are under conditional block
  // it is for a completely different use case
  // which unlikely coexists with the other one.
  // A warning is also added to the docs.
  if (isObservable(state$OrInit)) {
    const traceState$ = useObservable(() => state$OrInit.pipe(trace(flag)))
    const state$ = state$OrInit
    const [state, setState] = useState<TState | undefined>(() => {
      if (
        state$ instanceof BehaviorSubject ||
        (state$ as BehaviorSubject<TState>).value !== undefined
      ) {
        return (state$ as BehaviorSubject<TState>).value
      }
      if (typeof initialState === 'function') {
        return (initialState as () => TState)()
      }
      return initialState
    })

    useSubscription(traceState$, setState)

    useDebugValue(state)

    return state
  } else {
    const [state, setState] = useState<TState | undefined>(initialState)
    const input$Ref = useRefFn<Subject<TInput>>(() => new Subject<TInput>())
    const state$ = useRefFn(() =>
      state$OrInit(input$Ref.current, state).pipe(trace(flag))
    ).current
    const callback = useRef((inputValue: TInput) =>
      input$Ref.current.next(inputValue)
    ).current

    useSubscription(state$, setState)

    useDebugValue(state)

    return [state, callback]
  }
}
