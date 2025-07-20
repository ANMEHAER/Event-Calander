"use client"

import { format, parseISO } from "date-fns"
import { X, Edit, Trash, Calendar, Clock, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEvents } from "@/components/event-context"
import { useToast } from "@/hooks/use-toast"

export function EventDetails({ event, onClose, onEdit }) {
  const { dispatch } = useEvents()
  const { toast } = useToast()

  const handleDelete = () => {
    dispatch({ type: "DELETE_EVENT", id: event.id })
    toast({
      title: "Success",
      description: "Event deleted successfully",
    })
    onClose()
  }

  const getRecurrenceText = () => {
    if (!event.recurrence || event.recurrence.type === "none") {
      return "No repeat"
    }

    const { type, interval = 1, daysOfWeek, endDate } = event.recurrence

    let text = `Every ${interval > 1 ? interval + " " : ""}`

    switch (type) {
      case "daily":
        text += interval === 1 ? "day" : "days"
        break
      case "weekly":
        text += interval === 1 ? "week" : "weeks"
        break
      case "monthly":
        text += interval === 1 ? "month" : "months"
        break
      case "custom":
        if (daysOfWeek && daysOfWeek.length > 0) {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          text = `Weekly on ${daysOfWeek.map((d) => dayNames[d]).join(", ")}`
        } else {
          text += interval === 1 ? "day" : "days"
        }
        break
    }

    if (endDate) {
      text += ` until ${format(parseISO(endDate), "MMM d, yyyy")}`
    }

    return text
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Event Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: event.color }} />
              <h3 className="text-xl font-semibold">{event.title}</h3>
            </div>
            {event.description && <p className="text-muted-foreground">{event.description}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(parseISO(event.date), "EEEE, MMMM d, yyyy")}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <span>{getRecurrenceText()}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onEdit(event)} className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
