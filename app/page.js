"use client"
import { Calendar } from "@/components/calendar"
import { EventProvider } from "@/components/event-context"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <EventProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center">Event Calendar</h1>
            <p className="text-muted-foreground text-center mt-2">
              Manage your events with drag-and-drop, recurring events, and more
            </p>
          </div>
          <Calendar />
        </div>
        <Toaster />
      </div>
    </EventProvider>
  )
}
