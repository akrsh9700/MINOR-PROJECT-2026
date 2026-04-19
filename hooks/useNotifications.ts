import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Socket } from 'socket.io-client'

export interface NotificationItem {
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [notifications],
  )

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return
      setLoading(true)
      try {
        const res = await fetch('/api/notifications')
        if (!res.ok) return
        const data = (await res.json()) as NotificationItem[]
        setNotifications(data)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [isAuthenticated])

  useEffect(() => {
    let active = true

    const connect = async () => {
      if (!user?.id) return
      const { io } = await import('socket.io-client')
      if (!active) return

      const socket = io({
        path: '/socket.io',
      })
      socketRef.current = socket

      socket.emit('join', user.id)
      socket.on('new-notification', (n: NotificationItem) => {
        setNotifications((prev) => [n, ...prev])
      })
    }

    connect()

    return () => {
      active = false
      const socket = socketRef.current
      if (socket) {
        socket.off('new-notification')
        socket.disconnect()
        socketRef.current = null
      }
    }
  }, [user?.id])

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    } catch {
      // best-effort; keep optimistic UI
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
  }
}

