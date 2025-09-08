// /app/api/emergency/sos/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users, userLocations } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import nodemailer from "nodemailer"
import { getSession } from "@/lib/auth/session"

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "singhmehul072@gmail.com",
    pass: "ghfp pqen mejx qlan", 
  },
})

interface LocationData {
  latitude: string
  longitude: string
  timestamp: Date
  accuracy?: string
}

async function getLastKnownLocation(userId: number): Promise<LocationData | null> {
  try {
    const lastLocation = await db
      .select()
      .from(userLocations)
      .where(eq(userLocations.userId, userId))
      .orderBy(desc(userLocations.timestamp))
      .limit(1)

    if (lastLocation.length > 0) {
      const loc = lastLocation[0]
      return {
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: loc.timestamp!,
        accuracy: loc.accuracy || undefined,
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching last location:", error)
    return null
  }
}

function generateGoogleMapsLink(lat: string, lng: string): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15`
}

function generateEmailTemplate(
  userName: string,
  currentLocation: LocationData | null,
  lastKnownLocation: LocationData | null
) {
  const currentTime = new Date().toLocaleString()
  
  let locationInfo = ""
  if (currentLocation) {
    const mapsLink = generateGoogleMapsLink(currentLocation.latitude, currentLocation.longitude)
    locationInfo += `
      <p><strong>🌍 Current Location:</strong></p>
      <p>📍 Coordinates: ${currentLocation.latitude}, ${currentLocation.longitude}</p>
      <p>🕐 Time: ${currentLocation.timestamp.toLocaleString()}</p>
      <p>📍 <a href="${mapsLink}" target="_blank">View on Google Maps</a></p>
    `
  } else if (lastKnownLocation) {
    const mapsLink = generateGoogleMapsLink(lastKnownLocation.latitude, lastKnownLocation.longitude)
    locationInfo += `
      <p><strong>⚠️ Last Known Location:</strong></p>
      <p>📍 Coordinates: ${lastKnownLocation.latitude}, ${lastKnownLocation.longitude}</p>
      <p>🕐 Last Updated: ${lastKnownLocation.timestamp.toLocaleString()}</p>
      <p>📍 <a href="${mapsLink}" target="_blank">View on Google Maps</a></p>
      <p style="color:red;"><em>⚠️ This is not their current location</em></p>
    `
  } else {
    locationInfo = `
      <p style="color:red;"><strong>⚠️ Location Unknown</strong></p>
      <p>Unable to retrieve current or last known location.</p>
    `
  }

  return `
    <html>
    <body>
      <h1>🚨 EMERGENCY SOS ALERT</h1>
      <p><strong>${userName}</strong> has activated their SOS alert.</p>
      <p><strong>Time of Alert:</strong> ${currentTime}</p>
      ${locationInfo}
    </body>
    </html>
  `
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.userId

    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userData[0]

    // Sanitize emails: remove spaces, quotes, brackets
    const sosEmails = user.sosEmails
      ? user.sosEmails
          .split(",")
          .map(email => email.trim().replace(/^[\[\]"]+|[\[\]"]+$/g, ""))
          .filter(email => email && emailRegex.test(email))
      : []

    if (sosEmails.length === 0) {
      return NextResponse.json({
        error: "No valid SOS email contacts configured.",
      }, { status: 400 })
    }

    let currentLocation: LocationData | null = null
    let lastKnownLocation: LocationData | null = null

    try {
      const body = await request.json()
      if (body.latitude && body.longitude) {
        currentLocation = {
          latitude: body.latitude.toString(),
          longitude: body.longitude.toString(),
          timestamp: new Date(),
          accuracy: body.accuracy?.toString(),
        }
      }
    } catch {
      // Ignore if no location in request
    }

    if (!currentLocation) {
      lastKnownLocation = await getLastKnownLocation(userId)
    }

    const userName = user.name || user.email.split("@")[0]
    let emailsSent = 0
    const errors: string[] = []
    const emailTemplate = generateEmailTemplate(userName, currentLocation, lastKnownLocation)

    for (const email of sosEmails) {
      try {
        await transporter.sendMail({
          from: "singhmehul072@gmail.com", // Must match auth.user
          to: email,
          subject: `🚨 EMERGENCY SOS ALERT - ${userName} needs help!`,
          html: emailTemplate,
        })
        emailsSent++
      } catch (err) {
        console.error(`Failed to send email to ${email}:`, err)
        errors.push(`Failed to send email to ${email}`)
      }
    }

    if (emailsSent === 0) {
      return NextResponse.json({
        error: "Failed to send any emergency alerts.",
        details: errors,
      }, { status: 500 })
    }

    console.log(`SOS activated by user ${userId} (${userName}) at ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      contactsSent: emailsSent,
      message: `Emergency alerts sent to ${emailsSent} contacts.`,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error("SOS API Error:", error)
    return NextResponse.json({
      error: "Failed to process SOS request",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}
