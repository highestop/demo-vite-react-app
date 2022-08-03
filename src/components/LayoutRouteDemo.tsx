import React, { ReactElement } from 'react'
import { Routes, Route } from 'react-router-dom'

export const Layout = () => {}

export const routeConfigs: RouteConfig[] = [
  { key: 'project', title: '项目', element: null },
  {
    key: 'resource',
    title: '资源',
    element: null,
    children: [
      {
        key: 'storage/:type',
        path: 'storage/sql',
        title: '存储',
        element: null
      },
      { key: 'info', title: '基本信息', element: null }
    ]
  }
]

export interface RouteConfig {
  key: string
  path?: string
  title: string | ReactElement
  element: ReactElement | null
  children?: RouteConfig[]
}
export type RouteConfigSingle = Omit<RouteConfig, 'children'>
export type RouteConfigMap = Map<string, RouteConfigSingle>

export function appendConfig(configs: RouteConfig[]): RouteConfig[] {
  return configs.map(config => appendParent(config, ''))
}
export function appendParent(
  config: RouteConfig,
  parentPath: string | undefined
): RouteConfig {
  if (!config.path) {
    config.path = config.key
  }
  if (parentPath) {
    config.path = `${parentPath}/${config.path}`
  }
  if (!config.children?.length) {
    return config
  }
  return {
    ...config,
    children: config.children.map(child => appendParent(child, config.path))
  }
}
export function flattenConfig(configs: RouteConfig[]): RouteConfigMap {
  const routeConfigMap = new Map<string, RouteConfigSingle>([])
  configs.forEach(config => {
    routeConfigMap.set(config.key, {
      key: config.key,
      path: config.path,
      title: config.title,
      element: config.element
    })
    if (config.children?.length) {
      // TODO
    }
  })
  return routeConfigMap
}

export function getRouteElement(configs: RouteConfig[]): ReactElement {
  return (
    <Routes>
      {configs.map(config => {
        if (!config.children?.length) {
          return (
            <Route
              key={config.key}
              path={`/${config.path}/*`}
              element={config.element}
            />
          )
        }
        return (
          <Route
            key={config.key}
            path={`/${config.path}/*`}
            element={config.element}
          >
            {getRouteElement(config.children)}
          </Route>
        )
      })}
    </Routes>
  )
}
