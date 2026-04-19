import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emitToUserRoom } from '@/lib/socket'
import { NotificationType } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const userId = String(body?.userId ?? '')
    const title = String(body?.title ?? '')
    const message = String(body?.message ?? '')
    const type = String(body?.type ?? '') as NotificationType

    if (!userId || !title || !message || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    const isSelf = userId === session.user.id
    const isPrivileged = session.user.role === 'ADMIN'
    if (!isSelf && !isPrivileged) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    })

    emitToUserRoom(notification.userId, 'new-notification', notification)

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

