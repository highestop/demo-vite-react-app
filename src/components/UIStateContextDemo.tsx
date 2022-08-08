import constate from 'constate/dist/ts/src'
import React, { Dispatch, SetStateAction, useState } from 'react'

// 字段
export enum UIState {
    PopupState = 'popupState',
    AnotherState = 'anotherState'
}

// 类型
export interface UIStateTypeMap {
    [UIState.PopupState]: string
    [UIState.AnotherState]: number
}

// 默认值
export const UIStateInitialValue: { [key in UIState]: UIStateTypeMap[key] } = {
    [UIState.PopupState]: 'unset',
    [UIState.AnotherState]: 0
}

export const UIStateKeys = Object.values(UIState)

interface UIStateContext {
    getState: <T extends UIState>(stateKey: T) => UIStateTypeMap[T]
    setState: <T extends UIState>(stateKey: T) => Dispatch<SetStateAction<UIStateTypeMap[T]>>
}

// 用于创建 Context 的 InnerHook
function useUIStateContext(): UIStateContext {
    // 两个 Map 分别存储所有 stateKey 的 state 属性和 setState 方法
    const stateMap: Map<UIState, UIStateTypeMap[UIState]> = new Map()
    const setStateMap: Map<UIState, Dispatch<SetStateAction<UIStateTypeMap[UIState]>> | any> = new Map()

    // 遍历所有 stateKeys，创建 React Hook State
    UIStateKeys.forEach(<T extends UIState>(stateKey: T) => {
        /* eslint-disable-next-line react-hooks/rules-of-hooks */
        const [state, setState] = useState<UIStateTypeMap[T]>(UIStateInitialValue[stateKey])
        stateMap.set(stateKey, state)
        setStateMap.set(stateKey, setState)
    })

    // 返回对 Map 的 getter setter 接口函数
    const getState = <T extends UIState>(stateKey: T) => stateMap.get(stateKey) as UIStateTypeMap[T]
    const setState = <T extends UIState>(stateKey: T) => setStateMap.get(stateKey) as Dispatch<SetStateAction<UIStateTypeMap[T]>>
        
    console.debug('context rendered', stateMap, setStateMap)

    return { getState, setState }
}

// 创建 Constate Context
const [UIStateProvider, ...hooks] = constate(
    useUIStateContext,
    // 为每个 stateKey 拆分 getter 和 setter hook 出来
    ...UIStateKeys.map((stateKey) => (ctx: UIStateContext) => ctx.getState(stateKey)),
    ...UIStateKeys.map((stateKey) => (ctx: UIStateContext) => ctx.setState(stateKey))
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

// 在组件中使用
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

export const App = () => {
  return <Outer></Outer>
}
