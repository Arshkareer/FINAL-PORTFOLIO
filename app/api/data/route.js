export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const session = cookies().get('admin_session');
  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await db.project.findMany({ orderBy: { createdAt: "desc" } });
    const certificates = await db.certificate.findMany({ orderBy: { createdAt: "desc" } });
    
    return NextResponse.json({ projects, certificates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
