import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { emitToUserRoom } from '@/lib/socket';
import { NotificationType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a doctor
    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get patientId from query params
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    // Find doctor
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // If patientId provided, get that patient's records
    if (patientId) {
      const records = await prisma.medicalRecord.findMany({
        where: { patientId },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              bloodType: true
            }
          }
        },
        orderBy: { visitDate: 'desc' }
      });
      return NextResponse.json(records);
    }

    // Otherwise, get all records created by this doctor
    const records = await prisma.medicalRecord.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { visitDate: 'desc' },
      take: 20
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

// POST: Create new medical record
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const data = await request.json();

    // Create medical record
    const record = await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: doctor.id,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        notes: data.notes,
        bloodPressure: data.bloodPressure,
        temperature: data.temperature,
        pulse: data.pulse,
        weight: data.weight,
        visitDate: new Date(data.visitDate)
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
      select: { userId: true, firstName: true, lastName: true },
    });

    if (patient?.userId) {
      const notification = await prisma.notification.create({
        data: {
          userId: patient.userId,
          title: 'New medical record',
          message: `A new medical record was added by Dr. ${doctor.firstName} ${doctor.lastName}.`,
          type: NotificationType.SYSTEM_ALERT,
        },
      });
      emitToUserRoom(notification.userId, 'new-notification', notification);
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}