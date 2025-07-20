"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { X, Calendar, Clock, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useEvents } from "@/components/event-context"
import { useToast } from "@/hooks/use-toast"

export function EventForm({ event, selectedDate, onClose }) {
  const { dispatch, hasConflict } = useEvents()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: format(selectedDate, "yyyy-MM-dd"),
    time: "09:00",
    color: "#3b82f6",
    recurrence: {
      type: "none",
      interval: 1,
      daysOfWeek: [],
      endDate: "",
    },
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        color: event.color,
        recurrence: event.recurrence || {
          type: "none",
          interval: 1,
          daysOfWeek: [],
          endDate: "",
        },
      })
    }
  }, [event])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive",
      })
      return
    }

    const newEvent = {
      id: event?.id || `event-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      color: formData.color,
      recurrence: formData.recurrence.type !== "none" ? formData.recurrence : undefined,
    }

    // Check for conflicts
    if (hasConflict(newEvent, event?.id)) {
      toast({
        title: "Conflict Detected",
        description: "Another event exists at the same time. Do you want to continue?",
        variant: "destructive",
      })
      // In a real app, you might show a confirmation dialog here
    }

    if (event) {
      dispatch({ type: "UPDATE_EVENT", event: newEvent })
      toast({
        title: "Success",
        description: "Event updated successfully",
      })
    } else {
      dispatch({ type: "ADD_EVENT", event: newEvent })
      toast({
        title: "Success",
        description: "Event created successfully",
      })
    }

    onClose()
  }

  const colors = [
    { value: "#ef4444", label: "Red" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#10b981", label: "Green" },
    { value: "#f59e0b", label: "Yellow" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#ec4899", label: "Pink" },
  ]

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{event ? "Edit Event" : "Create Event"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color.value ? "border-foreground" : "border-muted"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recurrence</Label>
            <Select
              value={formData.recurrence.type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  recurrence: { ...formData.recurrence, type: value },
                })
              }
            >
              <SelectTrigger>
                <Repeat className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recurrence.type !== "none" && (
            <div className="space-y-4 p-3 bg-muted rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="interval">Repeat every</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={formData.recurrence.interval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurrence: {
                          ...formData.recurrence,
                          interval: Number.parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    className="w-20"
                  />
                  <span className="text-sm">
                    {formData.recurrence.type === "daily" && "day(s)"}
                    {formData.recurrence.type === "weekly" && "week(s)"}
                    {formData.recurrence.type === "monthly" && "month(s)"}
                    {formData.recurrence.type === "custom" && "day(s)"}
                  </span>
                </div>
              </div>

              {formData.recurrence.type === "custom" && (
                <div className="space-y-2">
                  <Label>Repeat on days</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={formData.recurrence.daysOfWeek.includes(day.value)}
                          onCheckedChange={(checked) => {
                            const newDays = checked
                              ? [...formData.recurrence.daysOfWeek, day.value]
                              : formData.recurrence.daysOfWeek.filter((d) => d !== day.value)
                            setFormData({
                              ...formData,
                              recurrence: {
                                ...formData.recurrence,
                                daysOfWeek: newDays,
                              },
                            })
                          }}
                        />
                        <Label htmlFor={`day-${day.value}`} className="text-sm">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="endDate">End date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.recurrence.endDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recurrence: {
                        ...formData.recurrence,
                        endDate: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {event ? "Update" : "Create"} Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
