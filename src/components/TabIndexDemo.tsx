import React from 'react'

export const App = () => {
  return (
    <div
      tabIndex={0}
      onKeyDown={e => {
        console.log('outside')
        // e.stopPropagation();
      }}
    >
      <div
        tabIndex={-1}
        onKeyDown={e => {
          console.log('inside')
          // e.stopPropagation();
        }}
      ></div>
    </div>
  )
}
