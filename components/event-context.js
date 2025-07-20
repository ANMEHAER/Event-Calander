"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { addDays, addWeeks, addMonths, isSameDay, parseISO, format } from "date-fns"

const initialState = {
  events: [],
  selectedDate: new Date(),
  viewDate: new Date(),
  searchTerm: "",
  selectedCategory: "all",
}

function eventReducer(state, action) {
  switch (action.type) {
    case "ADD_EVENT":
      return { ...state, events: [...state.events, action.event] }
    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((event) => (event.id === action.event.id ? action.event : event)),
      }
    case "DELETE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.id),
      }
    case "SET_EVENTS":
      return { ...state, events: action.events }
    case "SET_SELECTED_DATE":
      return { ...state, selectedDate: action.date }
    case "SET_VIEW_DATE":
      return { ...state, viewDate: action.date }
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.term }
    case "SET_SELECTED_CATEGORY":
      return { ...state, selectedCategory: action.category }
    case "MOVE_EVENT":
      return {
        ...state,
        events: state.events.map((event) => (event.id === action.id ? { ...event, date: action.newDate } : event)),
      }
    default:
      return state
  }
}

const EventContext = createContext(null)

export function EventProvider({ children }) {
  const [state, dispatch] = useReducer(eventReducer, initialState)

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("calendar-events")
    if (savedEvents) {
      try {
        const events = JSON.parse(savedEvents)
        dispatch({ type: "SET_EVENTS", events })
      } catch (error) {
        console.error("Failed to load events from localStorage:", error)
      }
    }
  }, [])

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(state.events))
  }, [state.events])

  const generateRecurringEvents = (event) => {
    if (!event.recurrence || event.recurrence.type === "none") {
      return [event]
    }

    const events = [event]
    const startDate = parseISO(event.date)
    const endDate = event.recurrence.endDate ? parseISO(event.recurrence.endDate) : addMonths(startDate, 12)
    const interval = event.recurrence.interval || 1

    let currentDate = startDate

    while (currentDate <= endDate) {
      switch (event.recurrence.type) {
        case "daily":
          currentDate = addDays(currentDate, interval)
          break
        case "weekly":
          currentDate = addWeeks(currentDate, interval)
          break
        case "monthly":
          currentDate = addMonths(currentDate, interval)
          break
        case "custom":
          if (event.recurrence.daysOfWeek && event.recurrence.daysOfWeek.length > 0) {
            // Weekly recurrence on specific days
            currentDate = addDays(currentDate, 1)
            while (!event.recurrence.daysOfWeek.includes(currentDate.getDay()) && currentDate <= endDate) {
              currentDate = addDays(currentDate, 1)
            }
          } else {
            currentDate = addDays(currentDate, interval)
          }
          break
      }

      if (currentDate <= endDate && !isSameDay(currentDate, startDate)) {
        events.push({
          ...event,
          id: `${event.id}-${format(currentDate, "yyyy-MM-dd")}`,
          date: format(currentDate, "yyyy-MM-dd"),
          originalDate: event.date,
        })
      }
    }

    return events
  }

  const getAllEvents = () => {
    const allEvents = []

    state.events.forEach((event) => {
      const recurringEvents = generateRecurringEvents(event)
      allEvents.push(...recurringEvents)
    })

    return allEvents
  }

  const getEventsForDate = (date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return getAllEvents().filter((event) => event.date === dateString)
  }

  const getFilteredEvents = () => {
    let events = getAllEvents()

    if (state.searchTerm) {
      events = events.filter(
        (event) =>
          event.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(state.searchTerm.toLowerCase()),
      )
    }

    if (state.selectedCategory !== "all") {
      events = events.filter((event) => event.color === state.selectedCategory)
    }

    return events
  }

  const hasConflict = (newEvent, excludeId) => {
    const eventsOnDate = getEventsForDate(parseISO(newEvent.date))

    return eventsOnDate.some((event) => {
      if (excludeId && event.id === excludeId) return false
      return event.time === newEvent.time
    })
  }

  return (
    <EventContext.Provider
      value={{
        state,
        dispatch,
        getEventsForDate,
        getFilteredEvents,
        hasConflict,
        generateRecurringEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider")
  }
  return context
}
