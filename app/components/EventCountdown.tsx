'use client';

import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: string): TimeLeft {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function DigitBlock({ value, label }: { value: number; label: string }) {
  const displayRef = useRef<HTMLDivElement>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value && displayRef.current) {
      // Flip animation on change
      gsap.fromTo(
        displayRef.current,
        { y: -12, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }
      );
      prevValue.current = value;
    }
  }, [value]);

  const display = String(value).padStart(2, '0');

  return (
    <div className="digit-block">
      <div className="digit-box futuristic-digit">
        <div ref={displayRef} className="digit-value">{display}</div>
      </div>
      <div className="digit-label">{label}</div>
    </div>
  );
}

interface EventCountdownProps {
  targetDate: string; // ISO date string e.g. "2026-09-15"
  eventTitle: string;
}

export default function EventCountdown({ targetDate, eventTitle }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetDate));
  const [expired, setExpired] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animation
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.3 }
      );
    }

    const timer = setInterval(() => {
      const left = getTimeLeft(targetDate);
      setTimeLeft(left);
      if (left.days === 0 && left.hours === 0 && left.minutes === 0 && left.seconds === 0) {
        setExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (expired) {
    return (
      <div className="countdown-container" ref={containerRef}>
        <div className="countdown-expired">
          <span className="expired-icon">✦</span>
          <span>Event is happening now — or has passed.</span>
        </div>
        <style jsx>{`
          .countdown-container { margin: 32px 0; }
          .countdown-expired {
            display: flex; align-items: center; gap: 12px;
            font-family: var(--font-mono); font-size: 0.9rem;
            color: #f59e0b; letter-spacing: 0.05em;
          }
          .expired-icon { font-size: 1.2rem; animation: spin 4s linear infinite; display: inline-block; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="countdown-container" ref={containerRef}>
      <div className="countdown-header">
        <div className="countdown-tag">
          <span className="tag-dot"></span>
          Counting Down
        </div>
        <p className="countdown-subtitle">Time remaining until <strong>{eventTitle}</strong></p>
      </div>

      <div className="countdown-digits">
        <DigitBlock value={timeLeft.days} label="Days" />
        <div className="colon">:</div>
        <DigitBlock value={timeLeft.hours} label="Hours" />
        <div className="colon">:</div>
        <DigitBlock value={timeLeft.minutes} label="Min" />
        <div className="colon">:</div>
        <DigitBlock value={timeLeft.seconds} label="Sec" />
      </div>

      <style jsx>{`
        .countdown-container {
          margin: 40px 0;
          padding: 32px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          backdrop-filter: blur(12px);
          box-shadow: 0 0 40px rgba(59, 130, 246, 0.08), inset 0 0 20px rgba(0,0,0,0.3);
        }
        .countdown-header { margin-bottom: 28px; }
        .countdown-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono); font-size: 0.7rem;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #60a5fa; margin-bottom: 8px;
        }
        .tag-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #60a5fa;
          box-shadow: 0 0 8px #60a5fa;
          animation: blink 1.5s infinite;
        }
        @keyframes blink { 50% { opacity: 0.3; } }
        .countdown-subtitle {
          font-size: 0.95rem; color: #94a3b8; margin: 0;
          font-weight: 400;
        }
        .countdown-subtitle strong { color: var(--white); font-weight: 600; }

        .countdown-digits {
          display: flex; align-items: center; gap: 16px;
          flex-wrap: wrap;
        }
        .digit-block {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .digit-box {
          width: 72px; height: 72px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(10, 15, 26, 0.8);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.1), inset 0 0 12px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
        }
        .digit-box::before {
          content: '';
          position: absolute; top: 50%; left: 0; right: 0;
          height: 1px; background: rgba(59, 130, 246, 0.1);
        }
        .digit-value {
          font-family: var(--font-mono);
          font-size: 2rem; font-weight: 300;
          color: #e2e8f0;
          text-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          line-height: 1;
        }
        .digit-label {
          font-family: var(--font-mono);
          font-size: 0.6rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: #475569;
        }
        .colon {
          font-family: var(--font-mono);
          font-size: 2rem; font-weight: 300;
          color: rgba(59, 130, 246, 0.5);
          margin-bottom: 20px;
          animation: blink 1s step-end infinite;
        }

        @media (max-width: 480px) {
          .digit-box { width: 56px; height: 56px; }
          .digit-value { font-size: 1.5rem; }
          .countdown-digits { gap: 8px; }
          .colon { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
