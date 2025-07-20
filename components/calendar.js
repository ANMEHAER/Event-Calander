"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDay } from "@/components/calendar-day"
import { EventForm } from "@/components/event-form"
import { EventDetails } from "@/components/event-details"
import { useEvents } from "@/components/event-context"

export function Calendar() {
  const { state, dispatch } = useEvents()
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const monthStart = startOfMonth(state.viewDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = "d"
  const rows = []
  let days = []
  let day = startDate

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day)
      day = addDays(day, 1)
    }
    rows.push(days)
    days = []
  }

  const handleDateClick = (date) => {
    dispatch({ type: "SET_SELECTED_DATE", date })
    setShowEventForm(true)
    setEditingEvent(null)
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setShowEventForm(true)
    setSelectedEvent(null)
  }

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "#ef4444", label: "Work" },
    { value: "#3b82f6", label: "Personal" },
    { value: "#10b981", label: "Health" },
    { value: "#f59e0b", label: "Social" },
    { value: "#8b5cf6", label: "Other" },
  ]

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch({ type: "SET_VIEW_DATE", date: subMonths(state.viewDate, 1) })}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">{format(state.viewDate, "MMMM yyyy")}</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch({ type: "SET_VIEW_DATE", date: addMonths(state.viewDate, 1) })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={state.searchTerm}
              onChange={(e) => dispatch({ type: "SET_SEARCH_TERM", term: e.target.value })}
              className="pl-8 w-[200px]"
            />
          </div>

          <Select
            value={state.selectedCategory}
            onValueChange={(value) => dispatch({ type: "SET_SELECTED_CATEGORY", category: value })}
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    {category.value !== "all" && (
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.value }} />
                    )}
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              dispatch({ type: "SET_SELECTED_DATE", date: new Date() })
              setShowEventForm(true)
              setEditingEvent(null)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-muted">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center font-medium text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {rows.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <CalendarDay
                key={`${weekIndex}-${dayIndex}`}
                date={day}
                isCurrentMonth={isSameMonth(day, monthStart)}
                isToday={isSameDay(day, new Date())}
                isSelected={isSameDay(day, state.selectedDate)}
                onClick={() => handleDateClick(day)}
                onEventClick={handleEventClick}
              />
            )),
          )}
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          event={editingEvent}
          selectedDate={state.selectedDate}
          onClose={() => {
            setShowEventForm(false)
            setEditingEvent(null)
          }}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} onEdit={handleEditEvent} />
      )}
    </div>
  )
}
