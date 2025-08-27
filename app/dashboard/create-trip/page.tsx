"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Copy, Check, CalendarIcon, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function CreateTripPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [maxMembers, setMaxMembers] = useState("10")
  const [isLoading, setIsLoading] = useState(false)
  const [createdTrip, setCreatedTrip] = useState<{ id: number; name: string; inviteCode: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!startDate) {
      toast({
        title: "Start date required",
        description: "Please select when your trip will start",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/trips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          startDate: startDate.toISOString(),
          endDate: endDate?.toISOString(),
          maxMembers: Number.parseInt(maxMembers),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCreatedTrip(data.trip)
        toast({
          title: "Trip Created! 🎉",
          description: "Your adventure is ready to be planned!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create trip",
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

  const copyInviteLink = async () => {
    if (!createdTrip) return

    const inviteLink = `${window.location.origin}/join/${createdTrip.inviteCode}`

    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  if (createdTrip) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Check className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Trip Created Successfully!</CardTitle>
            <CardDescription className="text-slate-600">
              Your adventure "{createdTrip.name}" is ready for planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white/70 rounded-xl p-4 border border-green-200">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Invite Code</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={createdTrip.inviteCode}
                  readOnly
                  className="bg-white border-green-300 text-slate-900 font-mono text-center"
                />
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-white/70 rounded-xl p-4 border border-green-200">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Share this link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={`${window.location.origin}/join/${createdTrip.inviteCode}`}
                  readOnly
                  className="bg-white border-green-300 text-slate-900 text-sm"
                />
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share the invite link with your friends</li>
                <li>• Review and approve join requests</li>
                <li>• Start the trip when everyone is ready</li>
                <li>• Enjoy live location sharing during your adventure!</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => router.push(`/dashboard/trips/${createdTrip.id}`)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Manage Trip
                <MapPin className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => {
                  setCreatedTrip(null)
                  setName("")
                  setDescription("")
                  setStartDate(undefined)
                  setEndDate(undefined)
                }}
                variant="outline"
                className="flex-1"
              >
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Create New Trip</CardTitle>
          <CardDescription className="text-slate-600">Plan your next adventure with friends and family</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Trip Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Weekend Beach Trip, City Adventure"
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description" className="text-slate-700 font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell your friends what this trip is about..."
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal border-slate-300",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal border-slate-300",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick end date (optional)"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < (startDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Maximum Members</Label>
                <Select value={maxMembers} onValueChange={setMaxMembers}>
                  <SelectTrigger className="h-12 border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 members</SelectItem>
                    <SelectItem value="10">10 members</SelectItem>
                    <SelectItem value="15">15 members</SelectItem>
                    <SelectItem value="20">20 members</SelectItem>
                    <SelectItem value="50">50 members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg rounded-xl font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Creating Trip..." : "Create Trip"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
