// components/expenses/ExpenseComments.tsx
"use client"

import useSWR from "swr"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight } from "lucide-react"

type CommentRow = {
  id: number
  userId: number
  userName?: string | null
  userAvatar?: string | null
  body: string
  createdAt: string | null
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "same-origin" })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err?.error || res.statusText)
  }
  return res.json()
}

export default function ExpenseComments({
  tripId,
  expenseId,
  currentUser,
}: {
  tripId: number
  expenseId: number
  currentUser?: { id: number; name?: string }
}) {
  const endpoint = `/api/trips/${tripId}/expenses/${expenseId}/comments`
  const { data, error, mutate, isValidating } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
  })
  const comments: CommentRow[] = data?.comments ?? []

  const [draft, setDraft] = useState("")
  const postingRef = useRef(false)
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  // Auto-resize textarea: expand downwards, up to a max height
  const MAX_TEXTAREA_HEIGHT = 240 // px — about 6-8 lines depending on font
  function resizeTextarea() {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = "auto"
    const newH = Math.min(ta.scrollHeight, MAX_TEXTAREA_HEIGHT)
    ta.style.height = `${newH}px`
  }

  useEffect(() => {
    resizeTextarea()
  }, [])

  useEffect(() => {
    // if cleared after posting, reset height
    if (taRef.current && draft === "") {
      taRef.current.style.height = ""
    }
  }, [draft])

  const post = async () => {
    if (!draft.trim() || postingRef.current) return
    postingRef.current = true
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload?.error || "Failed to post")
      setDraft("")
      // re-fetch comments
      await mutate()
    } catch (err: any) {
      // keep simple UX; you can replace with toast
      alert(err?.message || "Failed to post comment")
    } finally {
      postingRef.current = false
    }
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-slate-700 mb-2">Comments</h4>

      {/* input row (avatar + textarea + circular post button) */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : String(currentUser?.id ?? "U").slice(-1)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-end gap-2">
            {/* Textarea */}
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                requestAnimationFrame(resizeTextarea)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  post()
                }
              }}
              placeholder="Write a comment..."
              className="flex-1 min-h-[44px] max-h-[240px] resize-none rounded-md border px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-0"
              style={{ lineHeight: 1.4 }}
              rows={1}
            />
          
            {/* Send Button (outside box) */}
            <button
              onClick={post}
              title="Post comment"
              className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#00e2b7] to-teal-600 text-white shadow-md hover:opacity-95 transition"
            >
              <ArrowRight size={18} />
            </button>
          </div>
          {/* small hint / posting state */}
          <div className="flex justify-end mt-2">
            {isValidating && comments.length === 0 ? (
              <span className="text-xs text-slate-500">Loading comments…</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* comments list */}
      <div className="space-y-3 max-h-[310px] overflow-auto pr-2">
        {error && <div className="text-sm text-red-600">Failed to load comments: {String(error.message ?? error)}</div>}

        {!error && !isValidating && comments.length === 0 && (
          <div className="text-sm text-slate-500">No comments yet — be the first to add one.</div>
        )}

        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              {c.userAvatar ? (
                // simple img tag keeps Avatar component lightweight (like your previous code)
                // you may swap to <Image> if you need optimization
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.userAvatar} alt={c.userName ?? `U${c.userId}`} className="w-8 h-8 rounded-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {String(c.userName ? c.userName.charAt(0) : String(c.userId)).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  {c.userId === currentUser?.id ? (currentUser?.name ?? "You") : (c.userName ?? `User ${c.userId}`)}
                </div>
                <div className="text-xs text-slate-500">
                  {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ""}
                </div>
              </div>
              <p className="text-sm text-slate-800 break-words">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}