'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useNotifications } from '@/hooks/useNotifications'

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-3.5-3.5a8.38 8.38 0 01-2.5-6C14 3.5 10.5 0 6 0S-2 3.5-2 7.5c0 2.5 1 4.5 2.5 6L-3 17h5m8 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
)

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            <p className="text-xs text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>

          <div className="max-h-96 overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 text-center">No notifications yet</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.slice(0, 20).map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${n.read ? '' : 'bg-blue-50/50'}`}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id)
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

