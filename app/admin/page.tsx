import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Fetch pending applications
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });

  // Fetch all members count
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'MEMBER');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
      
      {/* Header */}
      <h1 className="font-anton text-[4rem] leading-[0.9] tracking-tighter text-[#d5f4f9] uppercase sm:text-[6rem]">
        SYSTEM OVERVIEW
      </h1>
      <div className="mt-4 flex gap-6 border-b border-white/5 pb-8">
        <div className="flex flex-col">
          <span className="font-jakarta text-[10px] font-bold tracking-[0.2em] text-[#9f8d8b] uppercase">Active Members</span>
          <span className="font-anton text-3xl text-white">{memberCount || 0}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-jakarta text-[10px] font-bold tracking-[0.2em] text-[#9f8d8b] uppercase">Pending Apps</span>
          <span className="font-anton text-3xl text-[#d5f4f9]">{applications?.length || 0}</span>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="mt-12">
        <h2 className="mb-6 font-jakarta text-[12px] font-bold tracking-[0.2em] text-[#b7c6c2] uppercase">
          Application Queue
        </h2>

        {applications && applications.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((app: any) => (
              <div key={app.id} className="group relative overflow-hidden rounded-md border border-white/5 bg-white/5 p-6 transition-colors hover:bg-white/10">
                <div className="mb-4">
                  <div className="font-anton text-2xl tracking-wide text-white uppercase">{app.name}</div>
                  <div className="font-jakarta text-[9px] font-bold tracking-[0.1em] text-[#9f8d8b] uppercase">
                    {app.department} • {app.year}
                  </div>
                </div>
                
                <div className="mb-6 font-jakarta text-xs leading-relaxed text-[#b7c6c2]/80">
                  <div className="font-semibold text-[#b7c6c2]">Why they want to join:</div>
                  "{app.reason}"
                </div>

                <div className="flex gap-2">
                  <form action="/api/admin/approve" method="post" className="flex-1">
                    <input type="hidden" name="id" value={app.id} />
                    <button className="w-full rounded-sm border border-[#b7c6c2]/30 bg-transparent py-2 font-jakarta text-[9px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#b7c6c2] hover:text-[#171e19]">
                      Approve
                    </button>
                  </form>
                  <form action="/api/admin/reject" method="post" className="flex-1">
                    <input type="hidden" name="id" value={app.id} />
                    <button className="w-full rounded-sm border border-[#ff4444]/30 bg-transparent py-2 font-jakarta text-[9px] font-bold uppercase tracking-[0.2em] text-[#ff4444] transition-colors hover:bg-[#ff4444] hover:text-white">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-24">
            <span className="font-mono text-[2rem] text-white/20">∅</span>
            <span className="mt-2 font-jakarta text-[10px] font-bold tracking-[0.2em] text-[#666] uppercase">Queue Empty</span>
          </div>
        )}
      </div>

    </div>
  );
}
