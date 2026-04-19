import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find patient by userId
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get all medical records for this patient
    const records = await prisma.medicalRecord.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      },
      orderBy: { visitDate: 'desc' }
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}