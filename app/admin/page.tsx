import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function AdminDashboard() {
  let applications = [];
  let memberCount = 0;

  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Fetch pending applications
    const { data: apps } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });
    
    if (apps) applications = apps;

    // Fetch all members count
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'MEMBER');
      
    if (count) memberCount = count;
  } catch (e) {
    console.warn("Supabase connection failed in Admin page:", e);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans">
      
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2">TELEMETRY_DECK</h1>
        <p className="text-[#4ade80] font-mono text-xs uppercase tracking-widest">Real-time Organism Status</p>
      </header>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#4ade80] opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2 font-mono">Active Members</div>
          <div className="text-4xl font-black text-white">{memberCount || 0}</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#f59e0b] opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2 font-mono">Pending Pipeline</div>
          <div className="text-4xl font-black text-white">{applications?.length || 0}</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#ef4444] opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2 font-mono">Security Incidents</div>
          <div className="text-4xl font-black text-white">0</div>
          <div className="absolute bottom-4 right-4 text-[#4ade80] text-xs font-mono animate-pulse">CLEAN</div>
        </div>
      </div>

      {/* Kanban Pipeline Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Membership Pipeline</h2>
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-white/70">{applications?.length || 0} Queued</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Pending */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#f59e0b] uppercase">New Signals (Pending)</h3>
              <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse"></div>
            </div>
            
            <div className="flex flex-col gap-3">
              {applications && applications.length > 0 ? (
                applications.map((app: any) => (
                  <div key={app.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-[#f59e0b]/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-white">{app.name}</div>
                      <div className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/70">{app.year}</div>
                    </div>
                    <div className="text-xs text-white/50 mb-3">{app.department}</div>
                    <div className="text-xs text-white/70 italic bg-black/30 p-2 rounded mb-4">"{app.reason}"</div>
                    
                    <div className="flex gap-2">
                      <form action="/api/admin/approve" method="post" className="flex-1">
                        <input type="hidden" name="id" value={app.id} />
                        <button className="w-full bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 rounded py-1.5 text-[10px] font-bold tracking-widest uppercase hover:bg-[#4ade80] hover:text-black transition-colors">
                          Approve
                        </button>
                      </form>
                      <form action="/api/admin/reject" method="post" className="flex-1">
                        <input type="hidden" name="id" value={app.id} />
                        <button className="w-full bg-[#ff4444]/10 text-[#ff4444] border border-[#ff4444]/30 rounded py-1.5 text-[10px] font-bold tracking-widest uppercase hover:bg-[#ff4444] hover:text-white transition-colors">
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-white/30">
                  <span className="font-mono mb-2">∅</span>
                  <span className="text-[10px] uppercase tracking-widest font-mono">No New Signals</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Processing (Mock) */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 min-h-[500px] opacity-50 pointer-events-none">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#3b82f6] uppercase">Processing</h3>
            </div>
            <div className="flex flex-col items-center justify-center h-full text-white/30">
              <span className="text-[10px] uppercase tracking-widest font-mono">Empty</span>
            </div>
          </div>

          {/* Column 3: Integrated (Mock) */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 min-h-[500px] opacity-50 pointer-events-none">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#4ade80] uppercase">Integrated</h3>
            </div>
            <div className="flex flex-col items-center justify-center h-full text-white/30">
              <span className="text-[10px] uppercase tracking-widest font-mono">Empty</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
