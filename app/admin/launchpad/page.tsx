import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function LaunchpadCommand() {
  let apps = [];
  
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Fetch launchpad applications if you have a table. If not, this is a placeholder.
    const { data: launchpadApps, error } = await supabase
      .from('launchpad_applications')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && launchpadApps) apps = launchpadApps;
  } catch (e) {
    console.warn("Supabase connection failed in Launchpad page:", e);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans">
      
      {/* Header */}
      <header className="mb-12 border-b border-[#4ade80]/20 pb-6">
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2">LAUNCHPAD_COMMAND</h1>
        <p className="text-[#4ade80] font-mono text-xs uppercase tracking-widest">Internship Intake Matrix</p>
      </header>

      <section>
        <div className="bg-black/50 border border-[#4ade80]/20 rounded-xl overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-[#4ade80]/10 font-mono text-[10px] uppercase tracking-widest text-[#4ade80]">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Track</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps && apps.length > 0 ? (
                apps.map((app: any) => (
                  <tr key={app.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{app.name}</div>
                      <div className="text-xs text-white/50">{app.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{app.track || 'GENERAL'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/10 rounded text-[10px] uppercase font-bold tracking-widest">{app.status || 'PENDING'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#4ade80] hover:text-white transition-colors text-xs font-mono uppercase tracking-widest">Review Resume -{'>'}</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <span className="font-mono text-2xl text-white/20 block mb-2">∅</span>
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/50">No Launchpad Signals</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
