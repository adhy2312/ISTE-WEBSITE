import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';

export default async function Login(props: {
  searchParams: Promise<{ message?: string }>;
}) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return redirect('/dashboard');
  }

  const signIn = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect('/login?message=' + encodeURIComponent(error.message));
    }

    return redirect('/dashboard');
  };

  const signUp = async (formData: FormData) => {
    'use server';

    const headerStore = await headers();
    const origin = headerStore.get('origin');
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback`,
      },
    });

    if (error) {
      return redirect('/login?message=' + encodeURIComponent(error.message));
    }

    return redirect('/login?message=Check email to confirm');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#171e19] font-jakarta selection:bg-[#b7c6c2] selection:text-[#171e19]">
      
      {/* Ambient Background Orbs */}
      <div className="pointer-events-none absolute left-[10%] top-[20%] h-[384px] w-[384px] animate-[float_6s_ease-in-out_infinite] rounded-full bg-[#b7c6c2] opacity-20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[10%] h-[384px] w-[384px] animate-[float_8s_ease-in-out_infinite_reverse] rounded-full bg-[#bbe2f5] opacity-20 blur-[120px]" />

      {/* Global CSS injected style for animations and typography override */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
        .text-outline {
          -webkit-text-stroke: 1px #b7c6c2;
          color: transparent;
        }
      `}} />

      {/* Massive Navbar / Mix-Blend Mode */}
      <nav className="fixed left-0 top-0 z-50 flex w-full items-center justify-between p-8 mix-blend-difference sm:px-12 sm:py-10">
        <div className="font-anton text-2xl tracking-widest text-white uppercase">ISTE MBCET</div>
        <a href="/" className="font-jakarta text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-60 border border-white px-5 py-2.5 rounded-full hover:bg-white hover:text-black">
          Return
        </a>
      </nav>

      {/* Core Interface Container */}
      <div className="z-10 flex w-full max-w-[900px] flex-col items-center px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        
        {/* Left Side: Massive Typography */}
        <div className="mb-12 flex w-full flex-col text-center lg:mb-0 lg:w-1/2 lg:text-left translate-y-0 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <h1 className="font-anton text-[12vw] leading-[0.85] tracking-tighter text-[#d5f4f9] uppercase lg:text-[8rem]">
            ACCESS
          </h1>
          <h2 className="font-anton text-[12vw] leading-[0.85] tracking-tighter uppercase text-outline lg:text-[8rem]">
            PORTAL
          </h2>
          <p className="mt-8 font-jakarta text-[11px] font-semibold tracking-[0.2em] text-[#9f8d8b] uppercase leading-relaxed max-w-[320px] mx-auto lg:mx-0">
            Secure login for registered student officers and members.
          </p>
        </div>

        {/* Right Side: Brutalist Compact Form */}
        <div className="w-full lg:w-1/2 max-w-[400px]">
          <form className="relative flex w-full flex-col gap-6 rounded-2xl border border-white/10 bg-[#302b2f]/30 p-10 backdrop-blur-md">
            
            <div className="flex flex-col gap-2">
              <label className="font-jakarta text-[10px] font-bold tracking-[0.15em] text-[#9f8d8b] uppercase">Identifier</label>
              <input
                className="w-full border-b border-[#b7c6c2]/20 bg-transparent px-0 py-3 font-jakarta text-lg text-white placeholder-white/20 outline-none transition-colors focus:border-[#d5f4f9]"
                name="email"
                placeholder="email@mbcet.ac.in"
                required
                autoComplete="off"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-jakarta text-[10px] font-bold tracking-[0.15em] text-[#9f8d8b] uppercase">Passkey</label>
              <input
                className="w-full border-b border-[#b7c6c2]/20 bg-transparent px-0 py-3 font-jakarta text-lg text-white placeholder-white/20 outline-none transition-colors focus:border-[#d5f4f9]"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                autoComplete="off"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                formAction={signIn}
                className="group relative flex-1 overflow-hidden border border-[#b7c6c2] bg-transparent py-4 font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-[#b7c6c2] transition-colors hover:text-[#171e19]"
              >
                <div className="absolute inset-0 bg-[#b7c6c2] translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                <span className="relative z-10">Authenticate</span>
              </button>
              <button
                formAction={signUp}
                className="flex-1 py-4 font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-[#9f8d8b] transition-colors hover:text-white"
              >
                Register
              </button>
            </div>
            
            {searchParams?.message && (
              <div className="absolute -bottom-16 left-0 w-full animate-in fade-in slide-in-from-top-2">
                <p className="font-jakarta text-center text-[10px] font-bold tracking-widest uppercase text-[#9f8d8b] border border-[#9f8d8b]/20 bg-[#171e19] px-4 py-3 rounded-full">
                  [!] {searchParams.message}
                </p>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
