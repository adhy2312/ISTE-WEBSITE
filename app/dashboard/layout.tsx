import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/login');
  }

  // Fetch basic profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  return (
    <div className="relative min-h-screen bg-[#171e19] font-jakarta text-[#b7c6c2] selection:bg-[#b7c6c2] selection:text-[#171e19]">
      
      {/* Ambient Background Orbs */}
      <div className="pointer-events-none fixed left-[5%] top-[10%] h-[384px] w-[384px] animate-[float_6s_ease-in-out_infinite] rounded-full bg-[#b7c6c2] opacity-10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[5%] right-[5%] h-[384px] w-[384px] animate-[float_8s_ease-in-out_infinite_reverse] rounded-full bg-[#bbe2f5] opacity-5 blur-[120px]" />

      {/* Global Style Override for this layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
        .text-outline { -webkit-text-stroke: 1px #b7c6c2; color: transparent; }
        .text-outline-dark { -webkit-text-stroke: 1px rgba(255,255,255,0.2); color: transparent; }
      `}} />

      {/* Elegant Glassmorphic Floating Navbar */}
      <div className="fixed left-0 right-0 top-8 z-50 flex w-full justify-center px-6">
        <nav className="flex w-full max-w-[900px] items-center justify-between rounded-full border border-white/10 bg-[#302b2f]/30 px-8 py-4 backdrop-blur-xl shadow-2xl transition-all">
          
          <div className="flex items-center gap-12">
            <div className="font-anton text-2xl tracking-widest text-[#d5f4f9] uppercase">ISTE <span className="text-[#b7c6c2]">MBCET</span></div>
            
            <div className="hidden items-center gap-8 sm:flex">
              <a href="/dashboard" className="font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-60">Home</a>
              <a href="/dashboard/events" className="font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-[#9f8d8b] transition-colors hover:text-white">Events</a>
              <a href="/dashboard/announcements" className="font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-[#9f8d8b] transition-colors hover:text-white">Log</a>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {profile?.role === 'EXECOM' && (
              <a href="/admin" className="font-jakarta text-[10px] font-bold uppercase tracking-[0.2em] text-[#171e19] bg-[#d5f4f9] px-5 py-2.5 rounded-full transition-transform hover:scale-105">
                Admin Panel
              </a>
            )}
            <form action="/auth/signout" method="post">
              <button className="font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-[#9f8d8b] transition-colors hover:text-[#ff4444]">
                Sign Out
              </button>
            </form>
          </div>
        </nav>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 pt-28 pb-16">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 sm:px-12 lg:flex-row lg:gap-24">
          
          {/* Identity Sidebar Wrapper */}
          <div className="flex w-full flex-col lg:w-1/4">
            <div className="flex flex-col items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#302b2f]/50 font-anton text-2xl text-[#b7c6c2]">
                U
              </div>
              <div>
                <p className="font-jakarta text-[10px] font-bold tracking-[0.2em] text-[#9f8d8b] uppercase">Session ID</p>
                <p className="max-w-[200px] truncate font-mono text-[11px] text-white/50">{session.user.id}</p>
                <p className="max-w-[200px] truncate font-jakarta mt-1 text-sm font-semibold tracking-wider text-[#b7c6c2]">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Dynamic Content Pane */}
          <main className="flex-1 w-full relative">
            {children}
          </main>

        </div>
      </div>
      
    </div>
  );
}
