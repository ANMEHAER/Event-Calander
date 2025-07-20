"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function EventItem({ event, onClick }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", event.id)
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={cn(
        "text-xs p-1 rounded cursor-pointer transition-all duration-200 text-white font-medium",
        "hover:shadow-md hover:scale-105",
        isDragging && "opacity-50 scale-95",
      )}
      style={{ backgroundColor: event.color }}
      title={`${event.title} - ${event.time}`}
    >
      <div className="truncate">{event.title}</div>
      <div className="text-xs opacity-90">{event.time}</div>
    </div>
  )
}
