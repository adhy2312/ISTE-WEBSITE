import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardOverview() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return redirect('/login');

  // Fetch full profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // Fetch Event Logs (if table exists)
  const { data: eventLogs } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .catch(() => ({ data: [] })); // Fallback if table doesn't exist yet

  // Fetch Certificates (if table exists)
  const { data: certificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .catch(() => ({ data: [] })); // Fallback

  const isProfileComplete = profile && profile.full_name && profile.department;

  return (
    <div className="flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-8 duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)]">
      
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="font-anton text-[4rem] leading-[0.8] tracking-tighter text-[var(--c-main)] uppercase sm:text-[6rem] lg:text-[7.5rem]">
          IDENTITY
        </h1>
        <h1 className="font-anton text-[4rem] leading-[0.8] tracking-tighter uppercase text-outline-dark sm:text-[6rem] lg:text-[7.5rem]">
          MATRIX
        </h1>
      </div>

      {!isProfileComplete ? (
        /* INITIALIZE IDENTITY FORM */
        <div className="rounded-xl border border-[var(--c-main)]/20 bg-[var(--g800)]/50 p-8 backdrop-blur-md">
          <div className="mb-6 border-b border-[var(--c-main)]/20 pb-4">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--c-main)]">Initialize Profile</h2>
            <p className="mt-1 font-sans text-xs text-[var(--g400)]">Your neural signature is incomplete. Update your parameters.</p>
          </div>
          
          <form action="/api/profile/update" method="post" className="flex max-w-md flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--c-alt1)]">Full Legal Name</label>
              <input name="full_name" required className="border-b border-[var(--border)] bg-transparent py-2 font-sans text-lg text-white outline-none transition-colors focus:border-[var(--c-main)]" placeholder="John Doe" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--c-alt1)]">Department / Branch</label>
              <input name="department" required className="border-b border-[var(--border)] bg-transparent py-2 font-sans text-lg text-white outline-none transition-colors focus:border-[var(--c-main)]" placeholder="Computer Science" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--c-alt1)]">Semester</label>
              <input name="semester" required className="border-b border-[var(--border)] bg-transparent py-2 font-sans text-lg text-white outline-none transition-colors focus:border-[var(--c-main)]" placeholder="S6" />
            </div>
            <button type="submit" className="mt-4 w-full bg-[var(--c-main)]/10 border border-[var(--c-main)]/30 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--c-main)] transition-colors hover:bg-[var(--c-main)] hover:text-black">
              Sync Identity
            </button>
          </form>
        </div>
      ) : (
        /* ACTIVE PROFILE DASHBOARD */
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Identity Core (Left Column) */}
          <div className="col-span-1 flex flex-col gap-6">
            <div className="group relative overflow-hidden rounded-xl border border-[var(--c-main)]/20 bg-[var(--g800)] p-8">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--c-main)] to-[var(--c-alt1)] opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--g400)]">Operator Profile</div>
              <div className="font-anton text-4xl text-white uppercase">{profile.full_name}</div>
              <div className="mt-2 font-mono text-xs uppercase text-[var(--c-alt1)] tracking-wider">
                {profile.department} // {profile.semester}
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--g400)]">Clearance</span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--c-main)]">{profile.role}</span>
              </div>
            </div>
          </div>

          {/* Neural Imprints & Certificates (Right Columns) */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
            
            {/* Event Logs */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--black)] p-8">
              <h3 className="mb-6 font-mono text-[12px] font-bold uppercase tracking-widest text-[var(--white)]">Neural Imprints (Event Log)</h3>
              <div className="flex flex-col gap-4">
                {eventLogs && eventLogs.length > 0 ? (
                  eventLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                      <div>
                        <div className="font-sans font-bold text-white">{log.event_name}</div>
                        <div className="font-mono text-[10px] uppercase text-[var(--g400)] tracking-widest">{new Date(log.created_at).toLocaleDateString()}</div>
                      </div>
                      <span className="rounded bg-[var(--c-main)]/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--c-main)]">Attended</span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center font-mono text-xs text-[var(--g400)] uppercase tracking-widest">
                    No imprints detected. Join an event to build your log.
                  </div>
                )}
              </div>
            </div>

            {/* Certificates Gallery */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--black)] p-8">
              <h3 className="mb-6 font-mono text-[12px] font-bold uppercase tracking-widest text-[var(--white)]">Digital Artifacts (Certificates)</h3>
              <div className="grid grid-cols-2 gap-4">
                {certificates && certificates.length > 0 ? (
                  certificates.map((cert: any) => (
                    <div key={cert.id} className="group relative aspect-video overflow-hidden rounded border border-[var(--border)] bg-[var(--g800)] p-4 hover:border-[var(--c-main)]/50 transition-colors cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                      <div className="absolute bottom-4 left-4 z-20">
                        <div className="font-sans font-bold text-white text-sm">{cert.title}</div>
                        <div className="font-mono text-[9px] uppercase text-[var(--c-main)] tracking-widest mt-1">View Artifact</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center border border-dashed border-[var(--border)] rounded font-mono text-xs text-[var(--g400)] uppercase tracking-widest">
                    No artifacts acquired yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
