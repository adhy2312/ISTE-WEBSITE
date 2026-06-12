'use client';

import { useEffect, useRef } from 'react';
import { useBrain } from './BrainProvider';
import { client } from '@/lib/sanity/client';
import type { InternshipData } from '@/app/internships/page';

/**
 * INTERNSHIP ENGINE
 * 
 * Fetches REAL internship data from Sanity CMS ONLY.
 * No fake/simulated data is generated — only verified, editorial-approved listings
 * from the CMS are surfaced to users.
 * 
 * The engine emits structured [FOUND_JSON] logs that LiveInternshipsList consumes.
 */
export default function InternshipEngine() {
  const { registerEngine, notifyEngine, activeEngines } = useBrain();
  const isRegistered = useRef(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!isRegistered.current) {
      registerEngine('Internship');
      isRegistered.current = true;
    }
  }, [registerEngine]);

  const isEngineActive = activeEngines.has('Internship');

  useEffect(() => {
    if (!isEngineActive || hasFetched.current) return;
    hasFetched.current = true;

    notifyEngine('Internship', 'agent_status', 'SCANNING NETWORK');

    // Fetch real internships from Sanity — the ONLY source of truth
    // Enforcing Hard Verification Gate: Only VERIFIED state and healthy links.
    client.fetch(`*[_type == "internship" && state == "VERIFIED" && verificationStatus == "VERIFIED" && linkHealthScore > 50 && defined(applyLink)] | order(_createdAt desc)[0...20] {
      _id, role, company, domain, type, stipend, duration, deadlineLabel, applyLink, status, description, state, verificationStatus, linkHealthScore
    }`).then(data => {
      if (data && data.length > 0) {
        notifyEngine('Internship', 'agent_status', `${data.length} OPPORTUNITIES FOUND`);

        // Emit each real listing as a structured JSON log
        data.forEach((item: InternshipData, i: number) => {
          setTimeout(() => {
            notifyEngine('Internship', 'agent_log', `[FOUND_JSON] ${JSON.stringify(item)}`);
          }, i * 200); // Stagger to avoid flooding the state
        });
      } else {
        notifyEngine('Internship', 'agent_status', 'NO OPEN LISTINGS');
        notifyEngine('Internship', 'agent_log', '[INFO] No verified open internships in CMS. Check Sanity Studio to add listings.');
      }
    }).catch(err => {
      console.warn('[InternshipEngine] Sanity fetch failed:', err);
      notifyEngine('Internship', 'agent_status', 'OFFLINE');
      notifyEngine('Internship', 'agent_log', '[ERROR] Could not reach Sanity CMS. Listings unavailable.');
    });

  }, [isEngineActive, notifyEngine]);

  return null;
}
