import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const patient = await prisma.patient.update({
      where: { userId: session.user.id },
      data: {
        phoneNumber: data.phoneNumber,
        address: data.address,
        city: data.city,
        emergencyContact: data.emergencyContact
      }
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}