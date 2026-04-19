import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emitToUserRoom } from '@/lib/socket';
import { AppointmentStatus, NotificationType, Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
try {
const { searchParams } = new URL(request.url);
const patientId = searchParams.get('patientId');
const doctorId = searchParams.get('doctorId');
const status = searchParams.get('status');

const where: Prisma.AppointmentWhereInput = {};
if (patientId) where.patientId = patientId;
if (doctorId) where.doctorId = doctorId;
if (status) {
  if (!Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  where.status = status as AppointmentStatus;
}

const appointments = await prisma.appointment.findMany({
    where,
    include: {
    patient: {
        select: {
        firstName: true,
        lastName: true,
        phoneNumber: true,
        }
    },
    doctor: {
        select: {
        firstName: true,
        lastName: true,
        specialization: true,
        consultationFee: true,
        department: {
            select: {
            name: true
            }
        }
        }
    }
    },
    orderBy: {
    appointmentDate: 'desc'
    }
});

return NextResponse.json(appointments);
} catch (error) {
console.error('Error fetching appointments:', error);
return NextResponse.json(
    { error: 'Failed to fetch appointments' },
    { status: 500 }
);
}
}

export async function POST(request: NextRequest) {
try {
const session = await getServerSession(authOptions);
if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const body = await request.json();
const { doctorId, appointmentDate, appointmentTime, reason } = body;
const patientId = session.user.profile?.id;

if (session.user.role !== 'PATIENT' || !patientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Check if appointment slot is already taken
const existingAppointment = await prisma.appointment.findFirst({
    where: {
    doctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: {
        not: 'CANCELLED'
    }
    }
});

if (existingAppointment) {
    return NextResponse.json(
    { error: 'This time slot is already booked' },
    { status: 400 }
    );
}

const appointment = await prisma.appointment.create({
    data: {
    patientId,
    doctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    reason,
    status: 'SCHEDULED'
    },
    include: {
    patient: {
        select: {
        firstName: true,
        lastName: true,
        }
    },
    doctor: {
        select: {
        firstName: true,
        lastName: true,
        specialization: true,
        userId: true,
        }
    }
    }
});

// Notify doctor in real-time
if (appointment.doctor.userId) {
    const notification = await prisma.notification.create({
        data: {
            userId: appointment.doctor.userId,
            title: 'New appointment request',
            message: `${appointment.patient.firstName} ${appointment.patient.lastName} booked an appointment for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}.`,
            type: NotificationType.APPOINTMENT_CREATED,
        },
    });
    emitToUserRoom(notification.userId, 'new-notification', notification);
}

// Notify patient (confirmation of request submission)
const patientNotification = await prisma.notification.create({
    data: {
        userId: session.user.id,
        title: 'Appointment request sent',
        message: `Your appointment request with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime} was submitted.`,
        type: NotificationType.SYSTEM_ALERT,
    },
});
emitToUserRoom(patientNotification.userId, 'new-notification', patientNotification);

return NextResponse.json(appointment, { status: 201 });
} catch (error) {
console.error('Error creating appointment:', error);
return NextResponse.json(
    { error: 'Failed to create appointment' },
    { status: 500 }
);
}
}