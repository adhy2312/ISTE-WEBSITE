import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function AnnouncementsPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)]">
      
      <h1 className="mb-12 font-anton text-[4rem] leading-[0.9] tracking-tighter text-[#d5f4f9] uppercase sm:text-[6rem]">
        TRANSMISSIONS
      </h1>

      {announcements && announcements.length > 0 ? (
        <div className="flex flex-col gap-4">
          {announcements.map((ann: any) => (
            <div key={ann.id} className="relative flex flex-col justify-between overflow-hidden border border-white/10 bg-[#302b2f]/30 p-8 pt-12 transition-colors hover:bg-white/5">
              
              {ann.pinned && (
                <div className="absolute right-0 top-0 bg-[#d5f4f9] px-4 py-2 font-jakarta text-[8px] font-bold tracking-[0.3em] text-[#171e19] uppercase">
                  [ PINNED ]
                </div>
              )}
              
              <div className="mb-6 border-b border-white/5 pb-6">
                <h3 className="font-anton text-2xl tracking-wide text-white uppercase sm:text-3xl pr-20">{ann.title}</h3>
                <div className="mt-2 font-mono text-[9px] tracking-[0.2em] text-[#9f8d8b] uppercase">
                  Log Entry: {new Date(ann.published_at).toISOString().split('T')[0]}
                </div>
              </div>
              
              <div>
                <p className="font-jakarta text-xs leading-relaxed text-[#b7c6c2] sm:text-sm">
                  {ann.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-white/10 py-24 bg-[#302b2f]/10">
          <p className="font-jakarta text-[10px] font-bold tracking-[0.2em] text-[#666] uppercase">No Active Transmissions</p>
        </div>
      )}
    </div>
  );
}
