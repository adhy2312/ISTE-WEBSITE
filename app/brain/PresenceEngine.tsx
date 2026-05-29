'use client';

import { useEffect, useState, useRef } from 'react';
import { useBrain } from './BrainProvider';
import { createClient } from '@supabase/supabase-js';

// Anonymous client for presence
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * ENGINE 44: PRESENCE ENGINE
 * Tracks real-time concurrent users exploring the website using Supabase Presence.
 * Renders a glowing multi-player indicator in the navbar.
 */
export default function PresenceEngine() {
  const brain = useBrain();
  const [activeUsers, setActiveUsers] = useState(1);
  const mounted = useRef(false);

  useEffect(() => {
    brain.registerEngine('Presence');
    if (!supabaseUrl || !supabaseAnonKey || mounted.current) return;
    mounted.current = true;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Prevents iOS Safari DOMException when localStorage is blocked
      }
    });
    
    // Create a random user ID for this session
    const userId = `visitor_${Math.floor(Math.random() * 1000000)}`;

    const channel = supabase.channel('online_users', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const userCount = Object.keys(newState).length;
        setActiveUsers(Math.max(1, userCount));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Inject the UI directly into the navbar if possible via React Portal, 
  // or we can just render it here since layout is global and we can use fixed positioning
  // or we can inject it into a specific DOM node.
  // We'll render a fixed pill on the top right instead, or we can use a portal.
  
  // Injecting into the navbar using a portal:
  const [navRightElement, setNavRightElement] = useState<Element | null>(null);
  
  useEffect(() => {
    // Find the navbar CTA button and insert before it
    const navRight = document.querySelector('.nav-cta');
    if (navRight && navRight.parentElement) {
      // We will create a div wrapper and portal into it, or just render a fixed badge.
      // Let's render a fixed badge for simplicity and guaranteed high z-index.
    }
  }, []);

  if (activeUsers <= 1) return null; // Don't show if alone

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '160px',
        zIndex: 9999,
        background: 'rgba(5, 5, 8, 0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        padding: '6px 12px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.75rem',
        color: 'var(--g400)',
        fontFamily: 'var(--font-mono)',
        pointerEvents: 'none',
        animation: 'fadeIn 1s ease forwards',
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
        boxShadow: '0 0 8px #4ade80', animation: 'heartbeat 2s infinite'
      }}></div>
      <span>{activeUsers} <span style={{ opacity: 0.6 }}>exploring</span></span>
    </div>
  );
}
