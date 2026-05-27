import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  let profile = null;

  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data } = await supabase.auth.getSession();
    session = data?.session;

    if (session) {
      const { data: pData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      profile = pData;
    }
  } catch (error) {
    // Supabase env keys missing or network error
    console.warn("Supabase connection failed in Admin layout:", error);
    
    // DEVELOPMENT BYPASS: Let the user see the UI locally even if Supabase is missing
    if (process.env.NODE_ENV === 'development') {
      session = { user: { email: 'admin@dev.local', id: 'dev-mode' } };
      profile = { role: 'EXECOM' };
    } else {
      return (
        <div className="flex h-screen items-center justify-center bg-black font-mono text-white">
          <div className="rounded border border-[#ff4444]/30 bg-[#ff4444]/10 p-8 text-center text-[#ff4444]">
            <h1 className="mb-2 text-xl font-bold uppercase tracking-widest">System Lockdown</h1>
            <p className="text-xs">Supabase Environment Variables Missing.</p>
          </div>
        </div>
      );
    }
  }

  // Double check the bypass
  if (!session && process.env.NODE_ENV === 'development') {
    session = { user: { email: 'admin@dev.local', id: 'dev-mode' } };
    profile = { role: 'EXECOM' };
  }

  if (!session) {
    return redirect('/login');
  }

  if (!profile || profile.role !== 'EXECOM') {
    return redirect('/dashboard');
  }

  return (
    <div className="admin-matrix min-h-screen bg-black text-white selection:bg-[#4ade80] selection:text-black flex" style={{ fontFamily: 'var(--font-mono)' }}>
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4ade80]/20 via-black to-black"></div>
      
      {/* Cyberpunk Sidebar */}
      <aside className="relative z-10 w-64 border-r border-[#4ade80]/20 bg-black/50 backdrop-blur-xl h-screen flex flex-col pt-8">
        <div className="px-6 mb-12">
          <div className="text-[#4ade80] text-xs font-bold tracking-[0.3em] uppercase animate-pulse mb-1">
            System Online
          </div>
          <div className="font-sans font-black text-2xl tracking-tighter">
            COMMAND<span className="text-[#4ade80]">_</span>CENTER
          </div>
        </div>

        <nav className="flex flex-col gap-2 px-4 flex-1">
          <a href="/admin" className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 transition-all hover:bg-[#4ade80]/20">
            <span className="text-lg">⌬</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Telemetry & Pipeline</span>
          </a>
          <a href="/admin/launchpad" className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/50 border border-transparent transition-all hover:bg-white/5 hover:text-white">
            <span className="text-lg group-hover:text-[#4ade80]">⟁</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Launchpad</span>
          </a>
          <a href="/studio" target="_blank" className="group flex items-center gap-3 px-4 py-3 rounded-lg text-white/50 border border-transparent transition-all hover:bg-white/5 hover:text-white">
            <span className="text-lg group-hover:text-[#4ade80]">✦</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Content</span>
          </a>
        </nav>

        <div className="p-6 border-t border-[#4ade80]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-[#4ade80]/20 border border-[#4ade80]/50 flex items-center justify-center text-[#4ade80] font-bold text-xs">
              {profile.role.substring(0, 2)}
            </div>
            <div>
              <div className="text-[10px] text-[#4ade80] uppercase tracking-widest font-bold">Operator</div>
              <div className="text-xs text-white/60 font-sans truncate">{session.user.email}</div>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="w-full text-center py-2 text-[10px] uppercase tracking-widest font-bold text-[#ff4444] border border-[#ff4444]/30 rounded hover:bg-[#ff4444]/10 transition-colors">
              Terminate Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 h-screen overflow-y-auto bg-[url('/noise.png')] bg-repeat bg-[length:100px_100px] bg-blend-overlay">
        <div className="max-w-[1400px] mx-auto p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
