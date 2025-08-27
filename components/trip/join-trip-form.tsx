"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, MapPin, Send, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JoinTripFormProps {
  trip: any
}

export function JoinTripForm({ trip }: JoinTripFormProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "active":
        return "bg-green-100 text-green-700 border-green-200"
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/trips/request-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          message: message.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setRequestSent(true)
        toast({
          title: "Request Sent! 📨",
          description: "The trip organizer will review your request",
        })
      } else {
        if (response.status === 401) {
          // User not logged in
          router.push(`/login?redirect=/join/${trip.inviteCode}`)
          return
        }
        toast({
          title: "Request Failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (trip.status === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
        <Card className="shadow-xl border-0 max-w-md w-full">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Trip Completed</h3>
            <p className="text-slate-600 mb-6">This trip has already ended and is no longer accepting new members.</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requestSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
        <Card className="shadow-xl border-0 max-w-md w-full bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Request Sent!</h3>
            <p className="text-slate-600 mb-6">
              Your join request has been sent to the trip organizer. You'll be notified once they review your request.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Join Trip</CardTitle>
            <CardDescription className="text-slate-600">You've been invited to join an adventure!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trip Details */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900">{trip.name}</h3>
                    <Badge className={`${getStatusColor(trip.status)} flex items-center gap-1`}>
                      <MapPin className="w-3 h-3" />
                      {trip.status}
                    </Badge>
                  </div>
                  <p className="text-slate-600 mb-4">{trip.description || "No description provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {trip.startDate && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Starts: {new Date(trip.startDate).toLocaleDateString()}</span>
                  </div>
                )}
                {trip.endDate && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Ends: {new Date(trip.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>Max {trip.maxMembers} members</span>
                </div>
              </div>
            </div>

            {/* Join Request Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-700 font-medium">
                  Message to Organizer (Optional)
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the organizer why you'd like to join this trip..."
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                  rows={4}
                />
                <p className="text-sm text-slate-500">
                  A brief message can help the organizer understand your interest in joining.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Join Request Process</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Your request will be sent to the trip organizer</li>
                      <li>• They'll review and approve/reject your request</li>
                      <li>• You'll be notified of their decision</li>
                      <li>• Once approved, you can access the trip and share your location</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg rounded-xl font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Sending Request..."
                ) : (
                  <>
                    Send Join Request
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-slate-600">
                Don't have an account?{" "}
                <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up first
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
