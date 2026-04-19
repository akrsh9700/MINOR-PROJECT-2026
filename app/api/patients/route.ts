import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function GET() {
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

    // Get unique patients who have appointments with this doctor
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: true
      },
      distinct: ['patientId']
    });

    const patients = appointments.map(apt => apt.patient);

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
