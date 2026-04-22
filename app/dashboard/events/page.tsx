import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function EventsPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)]">
      
      {/* Header */}
      <h1 className="mb-12 font-anton text-[4rem] leading-[0.9] tracking-tighter text-[#d5f4f9] uppercase sm:text-[6rem]">
        EVENTS LOG
      </h1>

      {events && events.length > 0 ? (
        <div className="flex flex-col gap-1">
          {events.map((evt: any) => (
            <div key={evt.id} className="group relative flex flex-col gap-6 overflow-hidden border border-white/5 bg-[#302b2f]/20 p-8 transition-colors hover:bg-white/5 sm:flex-row sm:items-center">
              
              {/* Massive Date Callout */}
              <div className="flex items-end gap-2 pr-8 sm:border-r sm:border-white/10">
                <span className="font-anton text-7xl leading-none text-white transition-transform duration-500 group-hover:-translate-y-2">
                  {new Date(evt.date).getDate().toString().padStart(2, '0')}
                </span>
                <span className="pb-2 font-jakarta text-[10px] font-bold tracking-[0.2em] text-[#9f8d8b] uppercase">
                  {new Date(evt.date).toLocaleString('default', { month: 'short' })}
                </span>
              </div>

              {/* Event Details */}
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-4">
                  <span className="rounded-full border border-[#b7c6c2]/30 px-3 py-1 font-jakarta text-[8px] font-bold tracking-[0.2em] text-[#b7c6c2] uppercase">
                    {evt.type}
                  </span>
                  <span className="font-jakarta text-[10px] font-bold tracking-[0.1em] text-[#666] uppercase">
                    📍 {evt.venue}
                  </span>
                </div>
                <h3 className="mb-2 font-anton text-3xl tracking-wide text-white uppercase">{evt.title}</h3>
                <p className="max-w-2xl font-jakarta text-xs leading-relaxed text-[#b7c6c2]/80">
                  {evt.description}
                </p>
              </div>

              {/* Action */}
              <div className="mt-4 sm:ml-auto sm:mt-0">
                <button className="relative overflow-hidden rounded-full border border-[#d5f4f9]/30 bg-transparent px-8 py-3 font-jakarta text-[9px] font-bold uppercase tracking-[0.2em] text-[#d5f4f9] transition-all hover:bg-[#d5f4f9] hover:text-[#171e19]">
                  RSVP
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-white/10 py-24 bg-[#302b2f]/10">
          <p className="font-jakarta text-[10px] font-bold tracking-[0.2em] text-[#666] uppercase">No Logs Discovered</p>
        </div>
      )}
    </div>
  );
}
