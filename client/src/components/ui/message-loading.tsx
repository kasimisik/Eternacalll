"use client"

import * as React from "react"

export function MessageLoading() {
  return (
    <div className="flex space-x-1">
      <div className="h-2 w-2 bg-current rounded-full animate-pulse"></div>
      <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  )
}