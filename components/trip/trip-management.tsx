"use client"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MapPin,
  Users,
  Calendar,
  Play,
  Square,
  UserMinus,
  Crown,
  Shield,
  MoreVertical,
  Check,
  X,
  Copy,
  ExternalLink,
  LogOut,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LiveMap } from "@/components/map/live-map"

import { BalanceResponse } from "@/lib/expenses/getBalance";
import ExpenseSummaryCard from "@/components/expenses/ExpenseSummaryCard";
import TripPhotosClient from "./TripPhotosClient"

type Photo = {
  id: number;
  tripId: number;
  userId: number;
  url: string;
  caption?: string | null;
  createdAt?: string | null;
};

interface TripManagementProps {
  trip: any
  members: any[]
  joinRequests: any[]
  currentUser: any
  userRole: string
  tripId: number;
  balances: BalanceResponse;
  initialPhotos: Photo[];
}

export function TripManagement({ trip, members, joinRequests, currentUser, userRole, tripId, balances, initialPhotos }: TripManagementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const isCreator = userRole === "creator"
  const isAdmin = userRole === "admin" || userRole === "creator"
  const canManageTrip = isAdmin

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "creator":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "admin":
        return <Shield className="w-4 h-4 text-blue-600" />
      default:
        return null
    }
  }

  const startTrip = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/trips/${trip.id}/start`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Trip Started! 🚀",
          description: "Live location sharing is now active for all members",
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: "Failed to start trip",
          description: data.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const endTrip = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/trips/${trip.id}/end`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Trip Ended",
          description: "Location sharing has been stopped for all members",
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: "Failed to end trip",
          description: data.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinRequest = async (requestId: number, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/trips/${trip.id}/join-requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast({
          title: action === "approve" ? "Request Approved" : "Request Rejected",
          description: `Join request has been ${action}d`,
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to process request",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const removeMember = async (memberId: number) => {
    try {
      const response = await fetch(`/api/trips/${trip.id}/members/${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Member Removed",
          description: "Member has been removed from the trip",
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to remove member",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const leaveTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${trip.id}/leave`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Left Trip",
          description: "You have left the trip",
        })
        router.push("/dashboard")
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to leave trip",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/join/${trip.inviteCode}`

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

  return (
    <div className="p-6 space-y-6">
      {/* Trip Header */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl text-slate-900">{trip.name}</CardTitle>
                <Badge className={`${getStatusColor(trip.status)} flex items-center gap-1`}>
                  <MapPin className="w-3 h-3" />
                  {trip.status}
                </Badge>
              </div>
              <CardDescription className="text-slate-600 mb-4">
                {trip.description || "No description provided"}
              </CardDescription>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {members.filter((m) => m.status === "approved").length} / {trip.maxMembers} members
                </span>
                {trip.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(trip.startDate).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center gap-1 font-mono">
                  Code: {trip.inviteCode}
                  <Button onClick={copyInviteLink} variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canManageTrip && trip.status === "planned" && (
                <Button onClick={startTrip} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Start Trip
                </Button>
              )}

              {canManageTrip && trip.status === "active" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Square className="w-4 h-4 mr-2" />
                      End Trip
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>End Trip?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will stop location sharing for all members and mark the trip as completed. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={endTrip} className="bg-red-600 hover:bg-red-700">
                        End Trip
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {!isCreator && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-2" />
                      Leave Trip
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Trip?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to leave this trip? You'll need to request to join again if you change
                        your mind.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={leaveTrip} className="bg-red-600 hover:bg-red-700">
                        Leave Trip
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Live Map for Active Trips */}
      {trip.status === "active" && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Live Location Map
            </CardTitle>
            <CardDescription>Real-time location sharing for all trip members</CardDescription>
          </CardHeader>
          <CardContent>
            <LiveMap tripId={trip.id} tripName={trip.name} members={members.filter((m) => m.status === "approved")} />
          </CardContent>
        </Card>
      )}
      {/* Expense Summary */}
      <ExpenseSummaryCard tripId={tripId} balances={balances} />
      
      {/* Trip Photos */}
      <Card>
          <CardHeader>
            <CardTitle>Trip Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <TripPhotosClient tripId={tripId} currentUser={currentUser} initialPhotos={initialPhotos} />
          </CardContent>
      </Card>

      {/* Trip Photos */}
      <Card>
          <CardHeader>
            <CardTitle>Trip Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <TripPhotosClient tripId={tripId} currentUser={currentUser} initialPhotos={initialPhotos} />
          </CardContent>
      </Card>

      {/* Trip Management Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Members</TabsTrigger>
          {canManageTrip && <TabsTrigger value="requests">Join Requests ({joinRequests.length})</TabsTrigger>}
          <TabsTrigger value="details">Trip Details</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Trip Members</CardTitle>
              <CardDescription>Manage who's part of this adventure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members
                  .filter((member) => member.status === "approved")
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900">{member.name}</h4>
                            {getRoleIcon(member.role)}
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{member.email}</p>
                          <p className="text-xs text-slate-500">
                            Joined: {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {canManageTrip && member.id !== currentUser.userId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isCreator && member.role === "member" && (
                              <DropdownMenuItem>
                                <Shield className="w-4 h-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => removeMember(member.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove from Trip
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canManageTrip && (
          <TabsContent value="requests">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Join Requests</CardTitle>
                <CardDescription>Review and approve people who want to join your trip</CardDescription>
              </CardHeader>
              <CardContent>
                {joinRequests.length > 0 ? (
                  <div className="space-y-4">
                    {joinRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                              {request.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-slate-900">{request.userName}</h4>
                            <p className="text-sm text-slate-600">{request.userEmail}</p>
                            {request.message && (
                              <p className="text-sm text-slate-700 mt-1 italic">"{request.message}"</p>
                            )}
                            <p className="text-xs text-slate-500">
                              Requested: {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleJoinRequest(request.id, "approve")}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleJoinRequest(request.id, "reject")}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No pending join requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="details">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>Information about this trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Trip Name</Label>
                  <p className="text-slate-900 mt-1">{trip.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Status</Label>
                  <Badge className={`${getStatusColor(trip.status)} mt-1`}>{trip.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Start Date</Label>
                  <p className="text-slate-900 mt-1">
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "Not set"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">End Date</Label>
                  <p className="text-slate-900 mt-1">
                    {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "Not set"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Maximum Members</Label>
                  <p className="text-slate-900 mt-1">{trip.maxMembers} people</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Invite Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-900 font-mono">{trip.inviteCode}</p>
                    <Button onClick={copyInviteLink} variant="ghost" size="sm" className="h-6 w-6 p-0">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Description</Label>
                <p className="text-slate-900 mt-1">{trip.description || "No description provided"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Share Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={`${window.location.origin}/join/${trip.inviteCode}`}
                    readOnly
                    className="bg-slate-50 text-slate-900 text-sm"
                  />
                  <Button onClick={copyInviteLink} variant="outline" size="sm">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => window.open(`${window.location.origin}/join/${trip.inviteCode}`, "_blank")}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
