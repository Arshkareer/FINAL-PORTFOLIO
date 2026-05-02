export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  // Check auth
  const session = cookies().get('admin_session');
  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const project = await db.project.create({
      data: {
        title: data.title,
        description: data.description,
        imagePath: data.imagePath,
        techStack: data.techStack,
        githubLink: data.githubLink,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = cookies().get('admin_session');
  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await db.project.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
