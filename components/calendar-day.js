"use client"

import { useState, useRef } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useEvents } from "@/components/event-context"
import { EventItem } from "@/components/event-item"

export function CalendarDay({ date, isCurrentMonth, isToday, isSelected, onClick, onEventClick }) {
  const { getEventsForDate, dispatch } = useEvents()
  const [isDragOver, setIsDragOver] = useState(false)
  const dayRef = useRef(null)

  const events = getEventsForDate(date)
  const displayEvents = events.slice(0, 3) // Show max 3 events
  const hasMoreEvents = events.length > 3

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)

    const eventId = e.dataTransfer.getData("text/plain")
    const newDate = format(date, "yyyy-MM-dd")

    dispatch({ type: "MOVE_EVENT", id: eventId, newDate })
  }

  return (
    <div
      ref={dayRef}
      className={cn(
        "min-h-[120px] p-1 border-r border-b cursor-pointer transition-colors relative",
        !isCurrentMonth && "bg-muted/30 text-muted-foreground",
        isToday && "bg-blue-50 dark:bg-blue-950/20",
        isSelected && "bg-blue-100 dark:bg-blue-900/30",
        isDragOver && "bg-green-100 dark:bg-green-900/30 border-green-400",
      )}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={cn("text-sm font-medium mb-1", isToday && "text-blue-600 dark:text-blue-400")}>
        {format(date, "d")}
      </div>

      <div className="space-y-1">
        {displayEvents.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            onClick={(e) => {
              e.stopPropagation()
              onEventClick(event)
            }}
          />
        ))}

        {hasMoreEvents && <div className="text-xs text-muted-foreground px-1">+{events.length - 3} more</div>}
      </div>
    </div>
  )
}
