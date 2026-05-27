'use client';

import { useEffect, useRef } from 'react';
import { useBrain } from './BrainProvider';

// Simulated Kerala Tech Hubs and Roles
const KERALA_HUBS = ['Trivandrum Tech Park', 'Kochi Infopark', 'Kozhikode Cyberpark', 'Remote (Kerala)', 'Startup Mission Kochi'];
const ROLES = ['Frontend Developer Intern', 'AI/ML Research Intern', 'UI/UX Designer', 'Backend Node.js Intern', 'Cloud Ops Intern', 'Cybersecurity Analyst Intern'];
const COMPANIES = ['TCS', 'Infosys', 'UST Global', 'Appzoc', 'QBurst', 'IBS Software', 'Tech Mahindra', 'Experion', 'Fingent'];

export default function InternshipEngine() {
  const { registerEngine, notifyEngine, activeEngines } = useBrain();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      registerEngine('Internship');
      mounted.current = true;
    }
  }, [registerEngine]);

  useEffect(() => {
    // Only run the simulation if the engine is registered
    if (!activeEngines.has('Internship')) return;

    // Simulate Agent Boot Sequence
    notifyEngine('Internship', 'agent_status', 'BOOTING NEURAL SCRAPER...');
    
    let isActive = true;

    const simulateAgentActivity = async () => {
      if (!isActive) return;

      // Phase 1: Scanning
      notifyEngine('Internship', 'agent_status', 'SCANNING NETWORK');
      const randomHub = KERALA_HUBS[Math.floor(Math.random() * KERALA_HUBS.length)];
      notifyEngine('Internship', 'agent_log', `[SCAN] Traversing subnet: ${randomHub}...`);
      
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      if (!isActive) return;

      // Phase 2: Analyzing or Finding
      const foundSomething = Math.random() > 0.4; // 60% chance to find
      
      if (foundSomething) {
        notifyEngine('Internship', 'agent_status', 'OPPORTUNITY DETECTED');
        const role = ROLES[Math.floor(Math.random() * ROLES.length)];
        const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
        notifyEngine('Internship', 'agent_log', `[FOUND] ${role} at ${company} (${randomHub})`);
      } else {
        notifyEngine('Internship', 'agent_status', 'ANALYZING');
        notifyEngine('Internship', 'agent_log', `[INFO] No match in sector ${Math.floor(Math.random() * 9999)}. Rerouting...`);
      }

      // Loop
      const nextDelay = 3000 + Math.random() * 5000;
      setTimeout(simulateAgentActivity, nextDelay);
    };

    // Start the infinite scanning loop after a short initial delay
    const initialDelay = setTimeout(simulateAgentActivity, 2000);

    return () => {
      isActive = false;
      clearTimeout(initialDelay);
    };
  }, [activeEngines, notifyEngine]);

  return null; // Invisible Engine
}
