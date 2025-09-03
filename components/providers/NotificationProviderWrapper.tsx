"use client"

import { NotificationProvider } from "@/contexts/NotificationContext"
import { ErrorBoundary } from "@/components/ErrorBoundary"

interface NotificationProviderWrapperProps {
  children: React.ReactNode
}

export function NotificationProviderWrapper({ children }: NotificationProviderWrapperProps) {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ErrorBoundary>
  )
}
