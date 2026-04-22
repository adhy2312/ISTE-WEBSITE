import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function DashboardOverview() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  // Fetch Member Application Status
  const { data: appData } = await supabase
    .from('applications')
    .select('status')
    .eq('user_id', session?.user.id)
    .single();

  const isMember = appData?.status === 'APPROVED';
  const isPending = appData?.status === 'PENDING';

  return (
    <div className="flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-8 duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)]">
      
      {/* Hero Typography */}
      <div className="flex flex-col">
        <h1 className="font-anton text-[4rem] leading-[0.8] tracking-tighter text-[#d5f4f9] uppercase sm:text-[6rem] lg:text-[7.5rem]">
          MEMBER
        </h1>
        <h1 className="font-anton text-[4rem] leading-[0.8] tracking-tighter uppercase text-outline-dark sm:text-[6rem] lg:text-[7.5rem]">
          DASHBOARD
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Widget */}
        <div className="group relative overflow-hidden rounded-md border border-white/10 bg-[#302b2f]/20 p-8 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-[#302b2f]/40">
          <div className="mb-8 font-jakarta text-[10px] font-bold tracking-[0.2em] text-[#9f8d8b] uppercase">System Status</div>
          
          <div className="flex items-end gap-6">
            <div className="font-anton text-6xl leading-none text-white lg:text-7xl">
              {isMember ? 'ACTIVE' : isPending ? 'PENDING' : 'NULL'}
            </div>
          </div>
          
          <div className="mt-6 border-t border-white/5 pt-6">
            <p className="font-jakarta text-xs font-medium leading-relaxed tracking-wider text-[#b7c6c2]/70">
              {isMember 
                ? "Your membership is active. You have full clearance to internal chapter events and logs." 
                : isPending 
                ? "Your application is under evaluation by the ExeCom. Await updates." 
                : "You are not registered as an active member. Apply to gain clearance."}
            </p>
          </div>
        </div>

        {/* Quick Action Widget */}
        <div className="relative overflow-hidden rounded-md border border-white/10 bg-[#171e19] p-8">
          <div className="mb-8 font-jakarta text-[10px] font-bold tracking-[0.2em] text-[#d5f4f9] uppercase">Application</div>
          
          <div className="flex h-full flex-col justify-between">
            <div className="font-jakarta text-sm leading-relaxed text-[#b7c6c2]">
              Submit your credentials and manifest to the review board for approval into ISTE.
            </div>
            
            <div className="mt-8">
              {!isMember && !isPending && (
                <button className="relative overflow-hidden border border-[#d5f4f9] px-8 py-3 font-jakarta text-[10px] font-bold uppercase tracking-[0.2em] text-[#d5f4f9] transition-colors hover:bg-[#d5f4f9] hover:text-[#171e19]">
                  Send Application
                </button>
              )}
              {isMember && (
                <div className="font-anton text-xl tracking-widest text-[#9f8d8b] uppercase">Clearance Check ✓</div>
              )}
              {isPending && (
                <div className="font-anton text-xl tracking-widest text-[#9f8d8b] uppercase">Processing...</div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
