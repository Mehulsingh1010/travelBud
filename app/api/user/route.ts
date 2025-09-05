// app/api/user/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/session";

async function deleteLocalAvatarIfExists(avatarUrl?: string) {
  if (!avatarUrl) return;
  // Only delete local uploads stored under /uploads/
  if (!avatarUrl.startsWith("/uploads/")) return;

  const relative = avatarUrl.replace(/^\//, ""); // e.g. uploads/123_162345.png
  const filepath = path.join(process.cwd(), "public", relative);

  try {
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
      console.log("Deleted old avatar:", filepath);
    }
  } catch (err) {
    console.warn("Failed to delete old avatar:", filepath, err);
    // non-fatal — continue
  }
}

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error("GET /api/user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
export async function PUT(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    const updateValues: Partial<Record<string, any>> = { updatedAt: new Date() };

    // Fetch current DB user (we need avatarUrl to delete previous file if necessary)
    const existingRows = await db.select().from(users).where(eq(users.id, session.userId));
    const existingUser = existingRows.length ? existingRows[0] : null;
    const previousAvatarUrl: string | undefined = existingUser?.avatarUrl as string | undefined;

    // A helper to flag that the previous avatar should be removed
    let shouldRemovePreviousAvatar = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      // parse user JSON if provided
      const userJson = formData.get("user");
      let incomingUser: any = {};
      if (userJson) {
        try {
          if (typeof userJson === "string") incomingUser = JSON.parse(userJson);
          else if ((userJson as any).text) {
            const txt = await (userJson as any).text();
            incomingUser = JSON.parse(txt);
          }
        } catch (e) {
          console.warn("Could not parse 'user' JSON from formData", e);
        }
      }

      // Collect simple fields
      const phoneNumber = incomingUser.phoneNumber ?? (formData.get("phoneNumber") as string | null) ?? undefined;
      const countryCode = incomingUser.countryCode ?? (formData.get("countryCode") as string | null) ?? undefined;
      const address = incomingUser.address ?? (formData.get("address") as string | null) ?? undefined;
      const description = incomingUser.description ?? (formData.get("description") as string | null) ?? undefined;
      const isNameVerified =
        typeof incomingUser.isNameVerified !== "undefined"
          ? incomingUser.isNameVerified
          : formData.get("isNameVerified") !== null
          ? formData.get("isNameVerified") === "true"
          : undefined;
      const isPhoneVerified =
        typeof incomingUser.isPhoneVerified !== "undefined"
          ? incomingUser.isPhoneVerified
          : formData.get("isPhoneVerified") !== null
          ? formData.get("isPhoneVerified") === "true"
          : undefined;
      const isAddressVerified =
        typeof incomingUser.isAddressVerified !== "undefined"
          ? incomingUser.isAddressVerified
          : formData.get("isAddressVerified") !== null
          ? formData.get("isAddressVerified") === "true"
          : undefined;

      if (phoneNumber !== undefined) updateValues.phoneNumber = phoneNumber;
      if (countryCode !== undefined) updateValues.countryCode = countryCode;
      if (address !== undefined) updateValues.address = address;
      if (description !== undefined) updateValues.description = description;
      if (isNameVerified !== undefined) updateValues.isNameVerified = isNameVerified;
      if (isPhoneVerified !== undefined) updateValues.isPhoneVerified = isPhoneVerified;
      if (isAddressVerified !== undefined) updateValues.isAddressVerified = isAddressVerified;

      // Remove avatar (if client requested removal)
      const removeAvatarFlag = formData.get("removeAvatar");
      if (removeAvatarFlag && typeof removeAvatarFlag === "string" && removeAvatarFlag === "true") {
        // delete previous file if local and clear DB column
        await deleteLocalAvatarIfExists(previousAvatarUrl);
        updateValues.avatarUrl = null;
        shouldRemovePreviousAvatar = false; // already removed
      }

      // Handle uploaded avatar file (field name "avatar")
      const avatarEntry = formData.get("avatar");
      if (avatarEntry && (avatarEntry as any).arrayBuffer) {
        // if there's an existing local avatar, delete it first
        await deleteLocalAvatarIfExists(previousAvatarUrl);

        const file: any = avatarEntry;
        const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const originalName = (file as any).name || `avatar-${Date.now()}`;
        const ext = path.extname(originalName) || "";
        const filename = `${session.userId}_${Date.now()}${ext}`;

        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const dest = path.join(uploadsDir, filename);

        await fs.promises.writeFile(dest, buffer);

        updateValues.avatarUrl = `/uploads/${filename}`;
      }
    } else {
      // JSON path
      const body = await req.json();
      const {
        phoneNumber,
        countryCode,
        address,
        description,
        avatarUrl,
        isNameVerified,
        isPhoneVerified,
        isAddressVerified,
        removeAvatar,
      } = body;

      if (phoneNumber !== undefined) updateValues.phoneNumber = phoneNumber;
      if (countryCode !== undefined) updateValues.countryCode = countryCode;
      if (address !== undefined) updateValues.address = address;
      if (description !== undefined) updateValues.description = description;
      if (isNameVerified !== undefined) updateValues.isNameVerified = isNameVerified;
      if (isPhoneVerified !== undefined) updateValues.isPhoneVerified = isPhoneVerified;
      if (isAddressVerified !== undefined) updateValues.isAddressVerified = isAddressVerified;

      if (removeAvatar === true) {
        // remove previous local file if any, and clear column
        await deleteLocalAvatarIfExists(previousAvatarUrl);
        updateValues.avatarUrl = null;
      } else if (avatarUrl !== undefined) {
        // If client provided explicit avatarUrl (e.g., clearing to empty string), handle that.
        updateValues.avatarUrl = avatarUrl;
      }
    }

    // Clean undefined
    Object.keys(updateValues).forEach((k) => updateValues[k] === undefined && delete updateValues[k]);

    // Persist update
    if (Object.keys(updateValues).length > 0) {
      await db.update(users).set(updateValues).where(eq(users.id, session.userId));
    }

    // Return updated user
    const updated = await db.select().from(users).where(eq(users.id, session.userId)).then((r) => r[0]);
    return NextResponse.json({ user: updated });
  } catch (err: any) {
    console.error("PUT /api/user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}