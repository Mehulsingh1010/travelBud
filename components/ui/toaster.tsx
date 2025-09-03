"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isSOS = variant === "sos" || title?.toLowerCase().includes("sos")

        return (
          <Toast
            key={id}
            {...props}
            className={cn(
              "group relative flex w-full max-w-sm items-center gap-3 rounded-xl p-4 shadow-lg",
              "animate-in slide-in-from-top-5 fade-in-80",
              "animate-out slide-out-to-top-5 fade-out-80",
              isSOS
                ? "bg-red-600 text-white" // 🚨 SOS toast
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white" // default
            )}
          >
            <div className="flex flex-col flex-1 gap-1">
              {title && (
                <ToastTitle className="font-semibold text-white">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription
                  className={cn(
                    "text-sm",
                    isSOS ? "text-red-100" : "text-blue-100"
                  )}
                >
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="absolute right-3 top-3 text-white/80 hover:text-white" />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-4 right-4 z-[100]" />
    </ToastProvider>
  )
}
