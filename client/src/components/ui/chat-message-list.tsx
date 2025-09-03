"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ChatMessageList({ 
  className, 
  children, 
  ...props 
}: ChatMessageListProps) {
  return (
    <div
      className={cn("flex flex-col space-y-4 p-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}