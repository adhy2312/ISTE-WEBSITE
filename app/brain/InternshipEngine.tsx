'use client';

import { useEffect, useRef } from 'react';
import { useBrain } from './BrainProvider';

import { client } from '@/lib/sanity/client';

const FALLBACK_ROLES = ['Frontend Developer Intern', 'AI/ML Research Intern', 'UI/UX Designer'];
const FALLBACK_COMPANIES = ['TCS', 'Infosys', 'UST Global'];
const FALLBACK_HUBS = ['Trivandrum Tech Park', 'Kochi Infopark', 'Remote'];

export default function InternshipEngine() {
  const { registerEngine, notifyEngine, activeEngines } = useBrain();
  const isRegistered = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Handle Registration
  useEffect(() => {
    if (!isRegistered.current) {
      registerEngine('Internship');
      isRegistered.current = true;
    }
  }, [registerEngine]);

  // 2. Handle Execution Loop
  // We only depend on the specific boolean value of whether THIS engine is active.
  // This prevents the loop from resetting if other engines register and activeEngines gets a new reference.
  const isEngineActive = activeEngines.has('Internship');

  useEffect(() => {
    if (!isEngineActive) return;

    notifyEngine('Internship', 'agent_status', 'BOOTING NEURAL SCRAPER...');
    
    let realInternships: any[] = [];
    
    // Fetch real internships from Sanity to simulate intelligent processing
    client.fetch(`*[_type == "internship" && status == "open"] | order(_createdAt desc)[0...10]`).then(data => {
      if (data && data.length > 0) {
        realInternships = data;
      }
    }).catch(err => {
      console.warn('[InternshipEngine] Failed to fetch real data', err);
    });

    let isActive = true;

    const simulateAgentActivity = async () => {
      if (!isActive) return;

      // Phase 1: Scanning
      notifyEngine('Internship', 'agent_status', 'SCANNING NETWORK');
      notifyEngine('Internship', 'agent_log', `[SCAN] Traversing global subnet nodes...`);
      
      // Await network delay
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, 3000 + Math.random() * 4000);
      });
      
      if (!isActive) return;

      // Phase 2: Analyzing or Finding
      const foundSomething = Math.random() > 0.4; // 60% chance to find
      
      if (foundSomething) {
        notifyEngine('Internship', 'agent_status', 'OPPORTUNITY DETECTED');
        
        let foundData;
        if (realInternships.length > 0) {
          // Pick a random real one to feed into the UI
          foundData = realInternships[Math.floor(Math.random() * realInternships.length)];
        } else {
          // Fallback dummy data if Sanity is empty
          foundData = {
            _id: Math.random().toString(36).substring(7),
            role: FALLBACK_ROLES[Math.floor(Math.random() * FALLBACK_ROLES.length)],
            company: FALLBACK_COMPANIES[Math.floor(Math.random() * FALLBACK_COMPANIES.length)],
            domain: FALLBACK_HUBS[Math.floor(Math.random() * FALLBACK_HUBS.length)],
            applyLink: '#',
            status: 'open'
          };
        }
        
        notifyEngine('Internship', 'agent_log', `[FOUND_JSON] ${JSON.stringify(foundData)}`);
      } else {
        notifyEngine('Internship', 'agent_status', 'ANALYZING');
        notifyEngine('Internship', 'agent_log', `[INFO] No match in sector ${Math.floor(Math.random() * 9999)}. Rerouting...`);
      }

      // Schedule next cycle
      const nextDelay = 8000 + Math.random() * 10000;
      timeoutRef.current = setTimeout(simulateAgentActivity, nextDelay);
    };

    // Start the infinite scanning loop after a short initial delay
    timeoutRef.current = setTimeout(simulateAgentActivity, 2000);

    return () => {
      isActive = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEngineActive]);

  return null; // Invisible Engine
}
