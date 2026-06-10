'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Bot, FileText, Zap, AlertTriangle, CheckCircle, Target, Lightbulb, RefreshCw, Sparkles } from 'lucide-react';

export default function ResumeAnalyzer({ liveInternships = [] }: { liveInternships?: any[] }) {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    verdict: string;
    criticalFlaws: string[];
    strengths: string[];
    lineByLineImprovements: { original_issue: string; suggested_fix: string; reason: string }[];
    atsKeywordsMissing: string[];
    internshipMatches?: { internshipId: string; company: string; role: string; matchScore: number; recommendation: string }[];
  } | null>(null);
  const [error, setError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useGSAP(() => {
    if (result && resultsRef.current) {
      // Stagger animate results
      gsap.fromTo('.result-card', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      );

      // Animate score number
      gsap.to({ val: 0 }, {
        val: result.score,
        duration: 1.5,
        ease: 'power3.out',
        onUpdate: function() {
          setAnimatedScore(Math.round(this.targets()[0].val));
        }
      });
    }
  }, [result]);

  const handleAnalyze = async () => {
    if (resumeText.length < 50) {
      setError('Please paste your full resume content (minimum 50 characters).');
      return;
    }
    
    setError('');
    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch('/api/agent/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText, 
          liveInternships: liveInternships.map(i => ({ 
            _id: i._id, role: i.role, company: i.company, description: i.description, skills: i.skills 
          })) 
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      setResult(data.data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'An unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { main: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }; // Emerald
    if (score >= 60) return { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }; // Amber
    return { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }; // Red
  };

  const scoreColors = result ? getScoreColor(result.score) : { main: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
  
  // Circular Progress Bar calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result ? circumference - (animatedScore / 100) * circumference : circumference;

  return (
    <div ref={containerRef} style={{
      marginTop: '80px',
      padding: '40px',
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      
      {/* Dynamic Background Glow */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '300px',
        background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15), transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Bot size={32} />
        </div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          AI-Powered <span style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ATS Analyzer</span>
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Paste your resume text below. Our intelligence engine will brutally grade it against live market requirements and provide exact, line-by-line rewrites.
        </p>
      </div>

      {!result && (
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', left: '16px', color: '#64748b' }}>
              <FileText size={20} />
            </div>
            <textarea 
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume here (Experience, Projects, Skills)..."
              style={{
                width: '100%',
                height: '320px',
                padding: '16px 16px 16px 48px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                color: '#e2e8f0',
                fontSize: '1rem',
                fontFamily: '"Fira Code", monospace',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 4px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
              }}
            />
          </div>
          
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginTop: '16px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '0.95rem' }}>
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              style={{
                padding: '16px 40px',
                background: isAnalyzing ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(to right, #2563eb, #3b82f6)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.15rem',
                fontWeight: 600,
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s ease',
                boxShadow: isAnalyzing ? 'none' : '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
              }}
              onMouseEnter={(e) => { if(!isAnalyzing) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { if(!isAnalyzing) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={22} className="animate-spin" />
                  Running Deep Analysis...
                </>
              ) : (
                <>
                  <Zap size={22} />
                  Analyze & Optimize
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div ref={resultsRef} style={{ position: 'relative', zIndex: 1 }}>
          {/* Top Score Section */}
          <div className="result-card" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '30px', 
            marginBottom: '40px', 
            padding: '32px', 
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))', 
            borderRadius: '24px', 
            border: `1px solid ${scoreColors.main}40`,
            boxShadow: `0 20px 40px -10px ${scoreColors.bg}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle 
                    cx="60" cy="60" r={radius} 
                    fill="transparent" 
                    stroke={scoreColors.main} 
                    strokeWidth="8" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: scoreColors.main, lineHeight: 1 }}>{animatedScore}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ATS Match</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>
                  <Bot size={16} /> AI Verdict
                </div>
                <p style={{ fontSize: '1.3rem', color: '#f8fafc', fontStyle: 'italic', lineHeight: 1.5, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>&quot;{result.verdict}&quot;</p>
              </div>
            </div>
            <button 
              onClick={() => setResult(null)} 
              style={{ 
                padding: '12px 24px', 
                background: 'rgba(255,255,255,0.05)', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            >
              Analyze New Resume
            </button>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {result.criticalFlaws.length > 0 && (
              <div className="result-card" style={{ background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.08), rgba(0,0,0,0))', padding: '32px', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <h3 style={{ color: '#ef4444', marginBottom: '20px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                  <AlertTriangle size={20} /> Critical Flaws
                </h3>
                <ul style={{ color: '#e2e8f0', padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {result.criticalFlaws.map((flaw: string, i: number) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', lineHeight: 1.6 }}>
                      <span style={{ color: '#ef4444', marginTop: '4px' }}>•</span>
                      <span>{flaw}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.strengths.length > 0 && (
              <div className="result-card" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08), rgba(0,0,0,0))', padding: '32px', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <h3 style={{ color: '#10b981', marginBottom: '20px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                  <CheckCircle size={20} /> Proven Strengths
                </h3>
                <ul style={{ color: '#e2e8f0', padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {result.strengths.map((str: string, i: number) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', lineHeight: 1.6 }}>
                      <span style={{ color: '#10b981', marginTop: '4px' }}>•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Keyword Missing */}
          {result.atsKeywordsMissing.length > 0 && (
            <div className="result-card" style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Sparkles size={20} color="#3b82f6" />
                <h3 style={{ color: '#f8fafc', fontSize: '1.3rem', fontWeight: 600 }}>Missing ATS Keywords</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {result.atsKeywordsMissing.map((kw: string, i: number) => (
                  <span key={i} style={{ 
                    padding: '8px 16px', 
                    background: 'rgba(59, 130, 246, 0.08)', 
                    color: '#60a5fa', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(59, 130, 246, 0.2)', 
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    letterSpacing: '0.02em'
                  }}>
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Line by Line Fixes */}
          {result.lineByLineImprovements.length > 0 && (
            <div className="result-card" style={{ marginBottom: '50px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Zap size={20} color="#f59e0b" />
                <h3 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 600 }}>Actionable Rewrites</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {result.lineByLineImprovements.map((item, i: number) => (
                  <div key={i} style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.03)', borderBottom: '1px dashed rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                        <AlertTriangle size={14} /> Weak Phrasing
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6, fontStyle: 'italic' }}>&quot;{item.original_issue}&quot;</div>
                    </div>
                    <div style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                        <CheckCircle size={14} /> AI Optimized
                      </div>
                      <div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.6, marginBottom: '16px' }}>&quot;{item.suggested_fix}&quot;</div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                        <Lightbulb size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>{item.reason}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Matches */}
          {result.internshipMatches && result.internshipMatches.length > 0 && (
            <div className="result-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '24px', padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Target size={28} color="#8b5cf6" />
                <h3 style={{ color: '#f8fafc', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Live Market Targets</h3>
              </div>
              <p style={{ color: '#cbd5e1', marginBottom: '32px', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '700px' }}>
                We cross-referenced your profile against the currently open opportunities in the launchpad. These roles are your absolute best statistical matches:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {result.internshipMatches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3).map((match, i) => {
                  const mColor = getScoreColor(match.matchScore);
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.6)', padding: '24px', borderRadius: '16px', borderTop: `4px solid ${mColor.main}`, boxShadow: '0 10px 20px -5px rgba(0,0,0,0.3)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                          <div style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px', lineHeight: 1.3 }}>{match.role}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{match.company}</div>
                        </div>
                        <div style={{ background: mColor.bg, color: mColor.main, padding: '6px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                          {match.matchScore}%
                        </div>
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', flex: 1 }}>
                        {match.recommendation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}
