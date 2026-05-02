export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  const session = cookies().get('admin_session');
  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const cert = await db.certificate.create({
      data: {
        title: data.title,
        description: data.description,
        imagePath: data.imagePath,
      },
    });
    return NextResponse.json(cert);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
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

    await db.certificate.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 });
  }
}
