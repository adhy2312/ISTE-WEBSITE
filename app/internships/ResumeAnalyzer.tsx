'use client';

import { useState, useRef, useEffect, DragEvent } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Bot, FileText, Zap, AlertTriangle, CheckCircle, Target, Lightbulb, RefreshCw, Sparkles, Cpu, Crosshair, UploadCloud } from 'lucide-react';
import { useBrain } from '../brain/BrainProvider';

export default function ResumeAnalyzer({ liveInternships = [] }: { liveInternships?: any[] }) {
  const brain = useBrain();
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{
    score: number;
    verdict: string;
    executiveSummaryRewrite?: string;
    weakVerbsToReplace?: string[];
    criticalFlaws: string[];
    strengths: string[];
    lineByLineImprovements: { original_issue: string; suggested_fix: string; reason: string }[];
    atsKeywordsMissing: string[];
    internshipMatches?: { internshipId: string; company: string; role: string; matchScore: number; recommendation: string }[];
  } | null>(null);
  const [error, setError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useGSAP(() => {
    // Initial entrance
    gsap.fromTo(formRef.current, 
      { opacity: 0, y: 40, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }
    );

    if (result && resultsRef.current) {
      // Stagger animate results - "New Gen" reveal
      gsap.fromTo('.result-item', 
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.2)', delay: 0.1 }
      );

      // Score counter
      gsap.to({ val: 0 }, {
        val: result.score,
        duration: 2,
        ease: 'power4.out',
        onUpdate: function() {
          setAnimatedScore(Math.round(this.targets()[0].val));
        }
      });
    }
  }, [result]);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF document.');
      return;
    }
    
    setError('');
    setIsExtracting(true);
    setDragActive(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/agent/extract-pdf', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to extract PDF text');
      
      setResumeText(data.text);
      gsap.fromTo('.resume-input', { backgroundColor: 'rgba(16, 185, 129, 0.2)' }, { backgroundColor: 'transparent', duration: 1 });
    } catch (err: any) {
      setError(err.message || 'Error extracting PDF.');
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (resumeText.length < 50) {
      setError('Insufficient data stream. Minimum 50 characters required.');
      return;
    }
    
    setError('');
    setIsAnalyzing(true);
    setResult(null);

    // Button push animation
    gsap.to('.analyze-btn', { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

    try {
      // [RUST COMPUTE ENGINE INTEGRATION]
      try {
        const modulePath = '/rust_engine/pkg/rust_engine.js';
        const rustModule = await import(/* webpackIgnore: true */ modulePath);
        console.log("⚡ Rust Wasm Engine intercepted the request!");
        brain.notifyEngine('Compute', 'intercepted');
        const rustData = JSON.parse(rustModule.analyze_resume_fast(resumeText, JSON.stringify(liveInternships)));
        console.log("Rust Output:", rustData);
        brain.notifyEngine('Compute', 'complete');
      } catch (e) {
        console.log("Rust Wasm engine not found or not compiled. Falling back to standard AI API...");
      }

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
        throw new Error(data.error || 'Neural analysis failed.');
      }

      setResult(data.data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'An unknown error occurred in the neural network.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreTheme = (score: number) => {
    if (score >= 80) return { hex: '#10b981', gradient: 'from-emerald-500 to-teal-400' };
    if (score >= 60) return { hex: '#f59e0b', gradient: 'from-amber-500 to-orange-400' };
    return { hex: '#ef4444', gradient: 'from-rose-500 to-red-500' };
  };

  const theme = result ? getScoreTheme(result.score) : { hex: '#06b6d4', gradient: 'from-cyan-500 to-blue-500' };
  
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result ? circumference - (animatedScore / 100) * circumference : circumference;

  return (
    <div ref={containerRef} className="resume-analyzer-wrapper" style={{ marginTop: '100px', marginBottom: '100px', position: 'relative' }}>
      
      {/* Background Ambient Glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '80%', height: '80%',
        background: `radial-gradient(circle, ${theme.hex}15 0%, transparent 70%)`,
        filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none', transition: 'background 1s ease'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '100px', color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '24px' }}>
            <Cpu size={14} color={theme.hex} /> Neural ATS Engine v2.0
          </div>
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
            Precision <span style={{ color: 'transparent', WebkitTextStroke: `1px ${theme.hex}` }}>Resume</span> Analysis
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Feed your resume into the network. We cross-reference against active launchpad opportunities to identify critical flaws and missing keywords.
          </p>
        </div>

        {/* Input Phase */}
        {!result && (
          <div ref={formRef} style={{ background: 'rgba(10, 15, 25, 0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '8px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5)' }}>
            <div 
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{ padding: '32px', border: `1px dashed ${dragActive ? theme.hex : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', position: 'relative', background: dragActive ? `${theme.hex}10` : 'transparent', transition: 'all 0.3s ease' }}
            >
              <div style={{ position: 'absolute', top: '48px', left: '48px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <FileText size={24} />
              </div>
              
              <textarea 
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder={isExtracting ? "Extracting neural data from PDF..." : "Initialize data stream: Paste full resume text here, or Drag & Drop a PDF document..."}
                disabled={isExtracting}
                className="resume-input"
                style={{
                  width: '100%', height: '350px', padding: '16px 16px 16px 56px',
                  background: 'transparent', border: 'none', color: '#e2e8f0',
                  fontSize: '1.05rem', fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  lineHeight: 1.7, resize: 'none', outline: 'none', opacity: isExtracting ? 0.5 : 1
                }}
              />
              
              {/* Overlay for Loading State */}
              {isExtracting && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <RefreshCw size={40} color={theme.hex} className="spin-fast" />
                  <div style={{ color: theme.hex, fontWeight: 700, letterSpacing: '0.1em' }}>DECODING PDF...</div>
                </div>
              )}
              
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} accept="application/pdf" style={{ display: 'none' }} />

              {/* Bottom Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', marginTop: '16px' }}>
                <div style={{ color: error ? '#ef4444' : '#475569', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {error ? <><AlertTriangle size={16} /> {error}</> : (
                    <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}>
                      <UploadCloud size={16} /> Upload PDF
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={handleAnalyze} disabled={isAnalyzing} className="analyze-btn"
                  style={{
                    padding: '16px 32px', background: isAnalyzing ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: isAnalyzing ? '#94a3b8' : '#0f172a', border: 'none', borderRadius: '12px',
                    fontSize: '1.05rem', fontWeight: 700, cursor: isAnalyzing ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isAnalyzing ? 'none' : `0 0 40px -10px ${theme.hex}`
                  }}
                  onMouseEnter={(e) => { if(!isAnalyzing) e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)' }}
                  onMouseLeave={(e) => { if(!isAnalyzing) e.currentTarget.style.transform = 'translateY(0) scale(1)' }}
                >
                  {isAnalyzing ? (
                    <><RefreshCw size={20} className="spin-fast" /> Processing Data...</>
                  ) : (
                    <><Zap size={20} /> Execute Analysis</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Dashboard Phase */}
        {result && (
          <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top Stats Banner */}
            <div className="result-item" style={{ display: 'flex', alignItems: 'stretch', gap: '24px' }}>
              {/* Score Circular Gauge */}
              <div style={{ background: 'rgba(10, 15, 25, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '280px' }}>
                <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                  <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 12px ${theme.hex}40)` }}>
                    <circle cx="75" cy="75" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                    <circle cx="75" cy="75" r={radius} fill="transparent" stroke={theme.hex} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{animatedScore}</span>
                    <span style={{ fontSize: '0.75rem', color: theme.hex, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Match</span>
                  </div>
                </div>
              </div>

              {/* Verdict Pane */}
              <div style={{ flex: 1, background: 'rgba(10, 15, 25, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: `radial-gradient(circle at top right, ${theme.hex}20, transparent 70%)` }} />
                <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '16px' }}>AI Verdict</div>
                <h3 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 400, lineHeight: 1.4, margin: 0 }}>&quot;{result.verdict}&quot;</h3>
                <button 
                  onClick={() => setResult(null)}
                  style={{ alignSelf: 'flex-start', marginTop: '32px', padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Scan New Document
                </button>
              </div>
            </div>

            {/* AI Executive Summary Rewrite */}
            {result.executiveSummaryRewrite && (
              <div className="result-item" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(15, 23, 42, 0.8))', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '24px', padding: '32px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#0ea5e9', borderTopLeftRadius: '24px', borderBottomLeftRadius: '24px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Bot size={24} color="#0ea5e9" />
                  <h4 style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>Executive Summary Rewrite</h4>
                </div>
                <p style={{ color: '#e2e8f0', fontSize: '1.1rem', lineHeight: 1.6, fontStyle: 'italic', margin: 0, paddingLeft: '16px', borderLeft: '2px dashed rgba(14, 165, 233, 0.3)' }}>
                  &quot;{result.executiveSummaryRewrite}&quot;
                </p>
                <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Sparkles size={12} style={{ display: 'inline', marginRight: '4px', marginBottom: '-2px' }}/> Copy-paste this into your objective section
                </div>
              </div>
            )}

            {/* Split Grid: Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="result-item" style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}><CheckCircle size={20} color="#10b981" /></div>
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Core Strengths</h4>
                </div>
                {result.strengths.length > 0 ? (
                  <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {result.strengths.map((str, i) => (
                      <li key={i} style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.5, display: 'flex', gap: '12px' }}>
                        <span style={{ color: '#10b981' }}>+</span> {str}
                      </li>
                    ))}
                  </ul>
                ) : <div style={{ color: '#475569', fontStyle: 'italic' }}>No notable strengths detected.</div>}
              </div>

              <div className="result-item" style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}><AlertTriangle size={20} color="#ef4444" /></div>
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Critical Flaws</h4>
                </div>
                {result.criticalFlaws.length > 0 ? (
                  <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {result.criticalFlaws.map((flaw, i) => (
                      <li key={i} style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.5, display: 'flex', gap: '12px' }}>
                        <span style={{ color: '#ef4444' }}>-</span> {flaw}
                      </li>
                    ))}
                  </ul>
                ) : <div style={{ color: '#475569', fontStyle: 'italic' }}>No critical flaws detected.</div>}
              </div>
            </div>

            {/* Weak Verbs Audit */}
            {result.weakVerbsToReplace && result.weakVerbsToReplace.length > 0 && (
              <div className="result-item" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <Target size={20} color="#f59e0b" />
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Weak Action Verbs Detected</h4>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '16px' }}>The ATS flagged these passive words. Replace them with strong verbs like &quot;Architected&quot;, &quot;Spearheaded&quot;, or &quot;Engineered&quot;.</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {result.weakVerbsToReplace.map((verb, i) => (
                    <span key={i} style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '6px 14px', borderRadius: '8px', fontSize: '0.9rem', textDecoration: 'line-through' }}>
                      {verb}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword Extraction */}
            {result.atsKeywordsMissing.length > 0 && (
              <div className="result-item" style={{ background: 'rgba(10, 15, 25, 0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <Sparkles size={20} color="#0ea5e9" />
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Missing Target Keywords</h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {result.atsKeywordsMissing.map((kw, i) => (
                    <span key={i} style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)', color: '#38bdf8', padding: '6px 14px', borderRadius: '100px', fontSize: '0.9rem', letterSpacing: '0.02em' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Line by Line Rewrites */}
            {result.lineByLineImprovements.length > 0 && (
              <div className="result-item" style={{ background: 'rgba(10, 15, 25, 0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                  <Zap size={20} color="#f59e0b" />
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Line-by-Line Rewrites</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {result.lineByLineImprovements.map((item, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', background: '#000', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ color: '#ef4444', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700 }}>Original (Weak)</div>
                        <div style={{ color: '#64748b', fontSize: '1rem', fontStyle: 'italic' }}>&quot;{item.original_issue}&quot;</div>
                      </div>
                      <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)' }}>
                        <div style={{ color: '#10b981', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700 }}>Optimized (Strong)</div>
                        <div style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '16px' }}>&quot;{item.suggested_fix}&quot;</div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#94a3b8', fontSize: '0.9rem' }}>
                          <Lightbulb size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                          {item.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Matches */}
            {result.internshipMatches && result.internshipMatches.length > 0 && (
              <div className="result-item" style={{ background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(15, 23, 42, 0.8))', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                  <Crosshair size={24} color="#8b5cf6" />
                  <h4 style={{ color: '#fff', fontSize: '1.5rem', margin: 0, letterSpacing: '-0.02em' }}>Live Target Matches</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {result.internshipMatches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3).map((match, i) => {
                    const mColor = getScoreTheme(match.matchScore);
                    return (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{match.role}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{match.company}</div>
                          </div>
                          <div style={{ color: mColor.hex, background: `${mColor.hex}15`, padding: '4px 10px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700 }}>
                            {match.matchScore}%
                          </div>
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>{match.recommendation}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .resume-input::placeholder { color: #475569; }
        .resume-input:focus { outline: none; }
        @keyframes spinFast { 100% { transform: rotate(360deg); } }
        .spin-fast { animation: spinFast 0.6s linear infinite; }
      `}} />
    </div>
  );
}
