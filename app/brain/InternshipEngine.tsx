'use client';

import { useEffect, useRef } from 'react';
import { useBrain } from './BrainProvider';

// Simulated Kerala Tech Hubs and Roles
const KERALA_HUBS = ['Trivandrum Tech Park', 'Kochi Infopark', 'Kozhikode Cyberpark', 'Remote (Kerala)', 'Startup Mission Kochi'];
const ROLES = ['Frontend Developer Intern', 'AI/ML Research Intern', 'UI/UX Designer', 'Backend Node.js Intern', 'Cloud Ops Intern', 'Cybersecurity Analyst Intern'];
const COMPANIES = ['TCS', 'Infosys', 'UST Global', 'Appzoc', 'QBurst', 'IBS Software', 'Tech Mahindra', 'Experion', 'Fingent'];

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
    
    let isActive = true;

    const simulateAgentActivity = async () => {
      if (!isActive) return;

      // Phase 1: Scanning
      notifyEngine('Internship', 'agent_status', 'SCANNING NETWORK');
      const randomHub = KERALA_HUBS[Math.floor(Math.random() * KERALA_HUBS.length)];
      notifyEngine('Internship', 'agent_log', `[SCAN] Traversing subnet: ${randomHub}...`);
      
      // Await network delay, tracked safely
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, 4000 + Math.random() * 6000);
      });
      
      if (!isActive) return;

      // Phase 2: Analyzing or Finding
      const foundSomething = Math.random() > 0.7; // 30% chance to find
      
      if (foundSomething) {
        notifyEngine('Internship', 'agent_status', 'OPPORTUNITY DETECTED');
        const role = ROLES[Math.floor(Math.random() * ROLES.length)];
        const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
        notifyEngine('Internship', 'agent_log', `[FOUND] ${role} at ${company} (${randomHub})`);
      } else {
        notifyEngine('Internship', 'agent_status', 'ANALYZING');
        notifyEngine('Internship', 'agent_log', `[INFO] No match in sector ${Math.floor(Math.random() * 9999)}. Rerouting...`);
      }

      // Schedule next cycle
      const nextDelay = 15000 + Math.random() * 15000;
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
