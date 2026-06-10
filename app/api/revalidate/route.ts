import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    // Check for secret to confirm this is a valid request
    if (secret !== process.env.MY_SECRET_TOKEN) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Revalidate the internships launchpad
    revalidatePath('/internships');
    // Also revalidate the homepage since it shows featured internships
    revalidatePath('/');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error('Revalidation error:', err);
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
