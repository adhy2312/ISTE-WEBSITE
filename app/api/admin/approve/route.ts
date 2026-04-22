import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
  const formData = await request.formData();
  const applicationId = formData.get('id') as string;

  if (!applicationId) return redirect('/admin');

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Validate admin session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'EXECOM') return redirect('/dashboard');

  // Update application to APPROVED
  await supabase
    .from('applications')
    .update({ status: 'APPROVED' })
    .eq('id', applicationId);

  return redirect('/admin');
}
