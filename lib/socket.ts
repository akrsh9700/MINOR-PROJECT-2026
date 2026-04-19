import type { Server as IOServer } from 'socket.io'

export type SocketNotificationEvent = 'new-notification'

declare global {
  var __io: IOServer | undefined
}

export function emitToUserRoom<T>(userId: string, event: SocketNotificationEvent, payload: T) {
  globalThis.__io?.to(userId).emit(event, payload)
}

