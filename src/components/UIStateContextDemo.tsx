import constate from 'constate/dist/ts/src'
import React, { Dispatch, SetStateAction, useState } from 'react'

export const App = () => {
  return <Outer></Outer>
}

export enum UIState {
  SomeState = 'someState',
  AnotherState = 'anotherState'
}

export interface UIStateTypeMap {
  [UIState.SomeState]: string
  [UIState.AnotherState]: number
}

export const UIStateInitialValue: { [key in UIState]: UIStateTypeMap[key] } = {
  [UIState.SomeState]: 'unset',
  [UIState.AnotherState]: 0
}

const UIStateKeys = Object.values(UIState)

interface UIStateContext {
  getState: <T extends UIState>(stateKey: T) => UIStateTypeMap[T]
  setState: <T extends UIState>(
    stateKey: T
  ) => Dispatch<SetStateAction<UIStateTypeMap[T]>>
}

function useUIStateContext(): UIStateContext {
  const stateMap: Map<UIState, UIStateTypeMap[UIState]> = new Map()
  const setStateMap: Map<
    UIState,
    Dispatch<SetStateAction<UIStateTypeMap[UIState]>> | any
  > = new Map()

  UIStateKeys.forEach(<T extends UIState>(stateKey: T) => {
    const [state, setState] = useState<UIStateTypeMap[T]>(
      UIStateInitialValue[stateKey]
    )
    stateMap.set(stateKey, state)
    setStateMap.set(stateKey, setState)
  })

  const getState = <T extends UIState>(stateKey: T) =>
    stateMap.get(stateKey) as UIStateTypeMap[T]
  const setState = <T extends UIState>(stateKey: T) =>
    setStateMap.get(stateKey) as Dispatch<SetStateAction<UIStateTypeMap[T]>>

  console.log('render context', stateMap, setStateMap)

  return { getState, setState }
}

// 创建 Constate Context
const [UIStateProvider, ...hooks] = constate(
  useUIStateContext,
  // 为每个 stateKey 拆分 getter 和 setter hook 出来
  ...UIStateKeys.map(
    stateKey => (ctx: UIStateContext) => ctx.getState(stateKey)
  ),
  ...UIStateKeys.map(
    stateKey => (ctx: UIStateContext) => ctx.setState(stateKey)
  )
)

// 将 hooks 分组存到两个 Index 索引中
const UIGetState = UIStateKeys.reduce((cur, key, index) => {
  cur[key] = hooks[index] as any
  return cur
}, {} as { [key in UIState]: () => UIStateTypeMap[key] })
const UISetState = UIStateKeys.reduce((cur, key, index) => {
  cur[key] = hooks[index + hooks.length / 2] as any
  return cur
}, {} as { [key in UIState]: () => Dispatch<SetStateAction<UIStateTypeMap[key]>> })

// 对外提供符合习惯的 hook
export const useGetState = <T extends UIState>(key: T) => UIGetState[key]()
export const useSetState = <T extends UIState>(key: T) => UISetState[key]()

function Outer() {
  console.log('render outer')

  return (
    <UIStateProvider>
      <Operator></Operator>
      <ShowSomeState></ShowSomeState>
      <ShowAnotherState></ShowAnotherState>
    </UIStateProvider>
  )
}

function Operator() {
  const updateSomeState = useSetState(UIState.SomeState)
  console.log('render operator')
  return <button onClick={() => updateSomeState('set')}>updateSomeState</button>
}

function ShowSomeState() {
  const someState = useGetState(UIState.SomeState)
  console.log('render show some')
  return <p>someState: {someState}</p>
}

function ShowAnotherState() {
  const anotherState = useGetState(UIState.AnotherState)
  console.log('render show another')
  return <p>anotherState: {anotherState}</p>
}
