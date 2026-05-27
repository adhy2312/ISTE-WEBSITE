import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const fullName = formData.get('full_name') as string;
  const department = formData.get('department') as string;
  const semester = formData.get('semester') as string;

  if (fullName && department && semester) {
    await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        department: department, 
        semester: semester 
      })
      .eq('id', session.user.id);
  }

  // Redirect back to the dashboard so it re-renders the active profile
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
