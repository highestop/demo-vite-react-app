import { tap, take, interval, Observable, Subscription } from 'rxjs'
import React from 'react'
import { useObservableState } from 'observable-hooks'
import { TapObserver } from 'rxjs/internal/operators/tap'

export const tapObserver: TapObserver<any> = {
  next: v => {
    console.log('next', v)
  },
  error: (e: any) => {
    console.log('error', e)
  },
  complete: () => {
    console.log('complete')
  },
  subscribe: () => {
    console.log('subscribe')
  },
  unsubscribe: () => {
    console.log('unsubscribe')
  },
  finalize: () => {
    console.log('finalize')
  }
}

export function trace<T>(flag: string) {
  // return map<T, T>((value) => {
  //   console.log(flag, value);
  //   return value;
  // });
  return tap<T>(tapObserver)
}

export function useConst<T>(fn: () => T) {
  return React.useMemo(fn, [])
}

export function useMarkedObservableState<T>(
  flag: string,
  observable: Observable<T>
): T | undefined
export function useMarkedObservableState<T>(
  flag: string,
  observable: Observable<T>,
  initialState: T
): T
export function useMarkedObservableState<T>(
  flag: string,
  observable: Observable<T>,
  initialState?: T
): T | undefined {
  const tracedObservable = React.useMemo(
    () => observable.pipe(trace<T>(flag)),
    []
  )
  return useObservableState(tracedObservable, initialState)
}

// === ROUND.7 ===
// 再看看 react 里面，先实现一套简易的 useMarkedSubscription 并带上 trace 能力
function useMarkedSubscription<T>(
  flag: string,
  observable: Observable<T>
): T | undefined {
  const [data, setData] = React.useState<T>()
  // 这样写发现完全没问题
  const observableRef = React.useRef<Subscription>()
  React.useEffect(() => {
    observableRef.current = observable.pipe(trace<T>(flag)).subscribe(setData)
    return () => observableRef.current?.unsubscribe()
  }, [])
  // 而只要改用 useSubscription 就有问题了
  // 至此定位到 useSubscription 的实现与 tap 兼容会出现异常现象，下一步阅读 useSubscription 源码
  // useSubscription(observable.pipe(trace<T>(flag)), setData);

  // === ROUND.8 ===
  // 观察 useSubscribe 源码发现其中的 useEffect deps 只有一个 observable
  // 这个 observable 应该是固定的所以我们没加，加上应该完全不影响
  // 但可能是 pipe 了之后每次都生成一个新的 observable 导致的
  // 所以把 trace 拿出去
  // React.useEffect(() => {
  //   observableRef.current = observable.subscribe(setData);
  //   return () => observableRef.current.unsubscribe();
  // }, [observable]);
  return data
}

const timer$ = interval(1000).pipe(
  take(5)
  // map((v) => {
  //   console.log('---', v);
  //   return v;
  // })
  // scan((memo, next) => memo + next, 0)
  // tap(() => console.log('---'))
)

// === ROUND.1 ===
// 先来试试 react / observable-hook 之外的 rxjs 订阅
// 这样是没问题的
// timer$.pipe(trace('subapp')).subscribe(tapObserver);
// 结果是
// - 1 组 subscribe，来自 tap
// - 2 组 next 0-4
// - 2 组 complete，来自 tap 和 subscribe
// - 1 组 finalize，来自 tap

// === ROUND.5 ===
// 回到 react / observable-hook 之外，尝试空 pipe，发现都没问题
// timer$.pipe(tap()).subscribe(tapObserver);
// timer$.pipe(tap(() => {})).subscribe(tapObserver);

// === ROUND.6 ===
// 搜到这么一段话 "so if you have () => {} in your subscribe, then you are waiting for the “final” data"。我们的 tap 加入空函数传参一样
// tap 与 subscribe 经常一起讨论，tap 偏向 emit 侧而 subscribe 偏向 receive 侧，所以 tap 经常用于脱离订阅场景产生 Side Effect 的时候。"tap is different to a subscribe on the Observable. If the Observable returned by tap is not subscribed, the side effects specified by the Observer will never happen. tap therefore simply spies on existing execution, it does not trigger an execution to happen like subscribe does."
// 尝试将 subscribe 的入参改为空和空函数
// 都是可以的，说明和这个没关系
// timer$.pipe(trace('rxjs')).subscribe();
// timer$.pipe(trace('rxjs')).subscribe(() => {});
// timer$.pipe(trace('rxjs')).subscribe({ next: () => {}, complete: () => {} });
// timer$.pipe(trace('rxjs')).subscribe((v) => console.log(v));
// timer$.pipe(trace('rxjs')).subscribe((v) => v);

export default function App() {
  return <SubApp></SubApp>
}

function SubApp() {
  // === ROUND.2 ===
  // 尝试 react / observable-hook 的场景
  // 这一行是正常的订阅，打印结果是 0 1 2 3 4
  // const timer = useObservableState(timer$);

  // === ROUND.3 ===
  // 这一行是调用自己封装的 Marked 函数，打印结果时 0 0 1 0 0 1 无限循环
  // 怀疑是触发了多重订阅，每次都订阅新的 timer，且之前的 timer 被 unsubscribe 了
  // const timer = useObservableState(timer$.pipe(trace('subapp')));

  // === ROUND.4 ===
  // 一步步尝试
  // 这个还可以
  // const timer = useObservableState(timer$.pipe(tap());
  // 加了 next 回调就不行了
  // const timer = useObservableState(timer$.pipe(tap(() => {})));
  // 换成 map 也不行
  // const timer = useObservableState(timer$.pipe(map((v) => v)));

  // === ROUND.8 ===
  // 发现确实是这个原因。因此我们需要保证 pipe 后的 observable 是一份 const
  // const tracedTimer$ = useConst(() => timer$.pipe(trace('subapp')));
  // const timer = useObservableState(tracedTimer$);

  // === ROUND.9 ===
  // 最后改一下我们的 useMarkedObservableState，成功！
  const timer = useMarkedObservableState('subapp', timer$)
  console.log('render', timer)
  return null
}
