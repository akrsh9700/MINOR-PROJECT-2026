import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emitToUserRoom } from '@/lib/socket'
import { AppointmentStatus, NotificationType } from '@prisma/client'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const status = String(body?.status ?? '') as AppointmentStatus

    if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, firstName: true, lastName: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { firstName: true, lastName: true, userId: true } },
      },
    })
    if (!appointment || appointment.doctorId !== doctor.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
    })

    const patientUserId = appointment.patient.userId
    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`
    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`
    const dateLabel = new Date(appointment.appointmentDate).toLocaleDateString()

    const notification = await prisma.notification.create({
      data: {
        userId: patientUserId,
        title: status === 'CONFIRMED' ? 'Appointment confirmed' : 'Appointment cancelled',
        message:
          status === 'CONFIRMED'
            ? `${doctorName} confirmed your appointment on ${dateLabel} at ${appointment.appointmentTime}.`
            : `${doctorName} cancelled your appointment on ${dateLabel} at ${appointment.appointmentTime}.`,
        type: status === 'CONFIRMED' ? NotificationType.APPOINTMENT_CONFIRMED : NotificationType.SYSTEM_ALERT,
      },
    })

    emitToUserRoom(notification.userId, 'new-notification', notification)

    return NextResponse.json({ ...updated, patientName })
  } catch (error) {
    console.error('Error updating appointment status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

