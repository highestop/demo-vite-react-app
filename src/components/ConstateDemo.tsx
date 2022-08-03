import constate from 'constate/dist/ts/src'
import React, { useEffect, useState } from 'react'
import { useEffectLog } from 'src/hooks/advancedHooks'

export function Constate() {
  useEffectLog('context')
  const [foo, setFoo] = useState(true)
  return (
    <TitleProvider>
      <button onClick={() => setFoo(!foo)}>Toggle</button>
      <Getter />
      <Setter1 />
      {foo && <Setter2 />}
    </TitleProvider>
  )
}

function Getter() {
  useEffectLog('getter')
  const title = useTitle()
  return <div>{title}</div>
}

function Setter1() {
  useEffectLog('setter 1')
  useTitleAuto('title 1')
  const titleSetter = useTitleSetter()
  return (
    <div>
      setter 1<button onClick={() => titleSetter('title 11')}>set to 11</button>
    </div>
  )
}

function Setter2() {
  useEffectLog('setter 2')
  useTitleAuto('title 2')
  const titleSetter = useTitleSetter()
  return (
    <div>
      setter 2<button onClick={() => titleSetter('title 22')}>set to 22</button>
    </div>
  )
}

function useTitleHook() {
  const [title, setTitle] = useState('default title')
  return { title, setTitle }
}

const [TitleProvider, useTitle, useTitleSetter] = constate(
  useTitleHook,
  x => x.title,
  x => x.setTitle
)

function useTitleAuto(title: string) {
  const titleSetter = useTitleSetter()
  useEffect(() => {
    titleSetter(title)
    return () => {
      titleSetter('default title')
    }
  })
}
