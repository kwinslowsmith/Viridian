import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; objectiveId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - no session' }, { status: 401 });
    }

    const { classId, objectiveId } = await params;
    const body = await request.json();
    const { title, type, url } = body;

    console.log('Adding material:', { classId, objectiveId, title, type, userEmail: session.user.email });

    if (!title || !type) {
      return NextResponse.json(
        { error: 'title and type are required' },
        { status: 400 }
      );
    }

    // Verify user is instructor of this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
    });

    if (!k12Class) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || k12Class.instructorId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to modify this class' },
        { status: 403 }
      );
    }

    // Verify objective exists
    const objective = await prisma.exampleObjective.findUnique({
      where: { id: objectiveId },
    });

    if (!objective) {
      return NextResponse.json(
        { error: 'Objective not found' },
        { status: 404 }
      );
    }

    // Create material
    const material = await prisma.objectiveMaterial.create({
      data: {
        objectiveId,
        classId,
        title,
        type,
        url: url || null,
        uploadedBy: user.id,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to create material:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; objectiveId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, objectiveId } = await params;
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('materialId');

    if (!materialId) {
      return NextResponse.json(
        { error: 'materialId query param required' },
        { status: 400 }
      );
    }

    // Verify user is instructor of this class
    const k12Class = await prisma.k12Class.findUnique({
      where: { id: classId },
    });

    if (!k12Class) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || k12Class.instructorId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to modify this class' },
        { status: 403 }
      );
    }

    // Verify material exists and belongs to this objective
    const material = await prisma.objectiveMaterial.findUnique({
      where: { id: materialId },
    });

    if (!material || material.objectiveId !== objectiveId) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Delete material
    await prisma.objectiveMaterial.delete({
      where: { id: materialId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to delete material:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
