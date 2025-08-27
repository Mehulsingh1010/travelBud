"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, ArrowRight, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function JoinTripPage() {
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteCode.trim()) {
      toast({
        title: "Invite code required",
        description: "Please enter a valid invite code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/trips/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Welcome to the trip! 🎉",
          description: `You've joined "${data.trip.name}"`,
        })
        router.push("/dashboard/trips")
      } else {
        toast({
          title: "Failed to join trip",
          description: data.error || "Invalid invite code",
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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Join a Trip</CardTitle>
          <CardDescription className="text-slate-600">
            Enter the invite code to join your friends' adventure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="text-slate-700 font-medium">
                Invite Code
              </Label>
              <Input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code (e.g., ABC123XYZ0)"
                className="h-12 border-slate-300 focus:border-purple-500 focus:ring-purple-500 font-mono text-center text-lg tracking-wider"
                maxLength={10}
                required
              />
              <p className="text-sm text-slate-500">Ask your friend for the invite code or use the link they shared</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg rounded-xl font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                "Joining Trip..."
              ) : (
                <>
                  Join Trip
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">How to join a trip:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Get the invite code from your friend</li>
                  <li>• Or click on the invite link they shared</li>
                  <li>• Enter the code above and click "Join Trip"</li>
                  <li>• Start sharing your location and have fun!</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
