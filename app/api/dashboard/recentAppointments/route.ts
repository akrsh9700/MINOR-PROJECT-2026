import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const userRole = searchParams.get('userRole');
    const userId = searchParams.get('userId');
    let whereClause = {};
    let orderBy = {};
    if (userRole === 'DOCTOR' && userId) {
      whereClause = {
        doctorId: userId,
        appointmentDate: {
          gte: new Date(), 
        },
      };
      orderBy = {
        appointmentDate: 'asc',
      };
    } else if (userRole === 'PATIENT' && userId) {
      whereClause = {
        patientId: userId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED'], 
        },
      };
      orderBy = {
        appointmentDate: 'asc',
      };
    } else {
      orderBy = {
        createdAt: 'desc',
      };
    }
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
      orderBy,
      take: limit,
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching recent appointments:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}