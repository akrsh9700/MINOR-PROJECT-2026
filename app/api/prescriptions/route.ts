import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emitToUserRoom } from '@/lib/socket'
import { NotificationType } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, firstName: true, lastName: true },
    })
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    const body = await request.json()
    const patientId = String(body?.patientId ?? '')
    const instructions = String(body?.instructions ?? '')
    const rawMedications: unknown[] = Array.isArray(body?.medications) ? body.medications : []

    if (!patientId || !instructions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { userId: true, firstName: true, lastName: true },
    })
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        doctorId: doctor.id,
        instructions,
        medications: {
          create: rawMedications.flatMap((m) => {
            if (!m || typeof m !== 'object') return []
            const r = m as Record<string, unknown>
            const medicationId = typeof r.medicationId === 'string' ? r.medicationId : ''
            const quantity = typeof r.quantity === 'number' ? r.quantity : Number(r.quantity)
            const dosage = typeof r.dosage === 'string' ? r.dosage : ''
            const duration = typeof r.duration === 'string' ? r.duration : ''

            if (!medicationId || !Number.isFinite(quantity) || quantity <= 0 || !dosage || !duration) return []

            return [
              {
                medicationId,
                quantity,
                dosage,
                duration,
              },
            ]
          }),
        },
      },
      include: {
        medications: true,
      },
    })

    const notification = await prisma.notification.create({
      data: {
        userId: patient.userId,
        title: 'New prescription',
        message: `A new prescription was created by Dr. ${doctor.firstName} ${doctor.lastName}.`,
        type: NotificationType.SYSTEM_ALERT,
      },
    })
    emitToUserRoom(notification.userId, 'new-notification', notification)

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
  }
}

