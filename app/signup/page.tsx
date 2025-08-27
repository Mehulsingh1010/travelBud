"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Compass, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedTerms) {
      toast({
        title: "Terms required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("travel_buddy_session", data.session)
        toast({
          title: "Welcome to TravelBuddy!",
          description: "Your account has been created successfully.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Sign up failed",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Compass className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">TravelBuddy</span>
            </Link>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900">Create your account</CardTitle>
            <CardDescription className="text-slate-600">Join thousands of travelers worldwide</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Full name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
                    placeholder="Create a secure password"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 text-slate-500 hover:text-slate-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                  I agree to the{" "}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="text-blue-600 hover:text-blue-700 underline font-medium">
                        Terms and Conditions
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Terms and Conditions</DialogTitle>
                        <DialogDescription>Please read and accept our terms and conditions</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 text-sm">
                        <section>
                          <h3 className="font-semibold mb-2">1. Location Services</h3>
                          <p>By using TravelBuddy, you consent to:</p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Sharing your real-time location with other trip members</li>
                            <li>Continuous location tracking while participating in active trips</li>
                            <li>Location data being updated every 1-2 seconds for smooth tracking</li>
                            <li>Your location being visible to all members of trips you join</li>
                          </ul>
                        </section>

                        <section>
                          <h3 className="font-semibold mb-2">2. Privacy and Data</h3>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Location data is only shared with trip members you choose to travel with</li>
                            <li>You can leave trips at any time to stop sharing your location</li>
                            <li>Historical location data may be stored for trip memories and analytics</li>
                            <li>We do not sell your location data to third parties</li>
                          </ul>
                        </section>

                        <section>
                          <h3 className="font-semibold mb-2">3. Safety and Responsibility</h3>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>You are responsible for your own safety while traveling</li>
                            <li>TravelBuddy is a coordination tool, not a safety guarantee</li>
                            <li>Always inform someone outside your travel group of your plans</li>
                            <li>Use common sense and follow local laws and regulations</li>
                          </ul>
                        </section>

                        <p className="text-xs text-muted-foreground mt-4">
                          By accepting these terms, you acknowledge that you understand the risks and responsibilities
                          of sharing location data and using our travel coordination services.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg rounded-xl font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
