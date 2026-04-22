import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/login');
  }

  // Check ExeCom Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'EXECOM') {
    // If they aren't marked as EXECOM, kick them to standard member dashboard
    return redirect('/dashboard');
  }

  return (
    <div className="relative min-h-screen bg-[#171e19] font-jakarta text-[#b7c6c2]">
      
      {/* Admin Nav */}
      <nav className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-white/5 bg-[#171e19]/80 px-8 py-5 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="font-anton text-xl tracking-widest text-white uppercase">COMMAND //</div>
          <div className="hidden font-jakarta text-[10px] font-bold uppercase tracking-[0.2em] text-[#9f8d8b] sm:block">
            ExeCom Operations
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="font-jakarta text-[10px] font-bold uppercase tracking-[0.2em] text-[#b7c6c2] transition-colors hover:text-white">
            Portal
          </a>
          <form action="/auth/signout" method="post">
            <button className="font-jakarta text-[10px] font-bold uppercase tracking-[0.2em] text-[#b7c6c2] transition-colors hover:text-[#ff4444]">
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <div className="pt-24 px-8 pb-12 max-w-[1200px] mx-auto">
        {children}
      </div>

    </div>
  );
}
