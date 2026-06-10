'use client';

import { useState } from 'react';

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
        body: JSON.stringify({ resumeText, liveInternships: liveInternships.map(i => ({ _id: i._id, role: i.role, company: i.company, description: i.description, skills: i.skills })) })
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
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div style={{
      marginTop: '80px',
      padding: '40px',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      position: 'relative',
      overflow: 'hidden'
    }} className="reveal">
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '12px' }}>
          AI-Powered <span style={{ color: '#3b82f6' }}>ATS Resume Analyzer</span>
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Paste your resume text below. Our elite AI engine acts as a senior technical recruiter to brutally grade your resume and provide 100% accurate, line-by-line improvements to help you land the interview.
        </p>
      </div>

      {!result && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <textarea 
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your entire resume text here... (Experience, Projects, Skills, Education)"
            style={{
              width: '100%',
              height: '300px',
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '1rem',
              fontFamily: 'monospace',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          
          {error && <div style={{ color: '#ef4444', marginTop: '12px', fontSize: '0.9rem' }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              style={{
                padding: '16px 32px',
                background: isAnalyzing ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background 0.3s, transform 0.2s'
              }}
              onMouseEnter={(e) => { if(!isAnalyzing) e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={(e) => { if(!isAnalyzing) e.currentTarget.style.transform = 'scale(1)' }}
            >
              {isAnalyzing ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Analyzing Resume...
                </>
              ) : (
                'Generate ATS Report →'
              )}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div style={{ animation: 'slideInUp 0.5s ease forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '40px', padding: '30px', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: `1px solid ${getScoreColor(result.score)}` }}>
            <div>
              <div style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '8px' }}>ATS Match Score</div>
              <div style={{ fontSize: '4rem', fontWeight: 800, color: getScoreColor(result.score), lineHeight: 1 }}>{result.score}<span style={{ fontSize: '2rem', color: '#64748b' }}>/100</span></div>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '8px' }}>AI Verdict</div>
              <p style={{ fontSize: '1.2rem', color: '#f8fafc', fontStyle: 'italic', lineHeight: 1.5 }}>&quot;{result.verdict}&quot;</p>
            </div>
            <button 
              onClick={() => setResult(null)} 
              style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer' }}
            >
              Analyze Another
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>⚠️</span> Critical Flaws</h3>
              <ul style={{ color: '#f8fafc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.criticalFlaws.map((flaw: string, i: number) => <li key={i}>{flaw}</li>)}
              </ul>
            </div>
            
            <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <h3 style={{ color: '#22c55e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>✅</span> Strengths</h3>
              <ul style={{ color: '#f8fafc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.strengths.map((str: string, i: number) => <li key={i}>{str}</li>)}
              </ul>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#f8fafc', marginBottom: '16px', fontSize: '1.4rem' }}>Line-by-Line AI Rewrites</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.lineByLineImprovements.map((item, i: number) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Original (Weak)</div>
                    <div style={{ color: '#f8fafc', fontFamily: 'monospace' }}>&quot;{item.original_issue}&quot;</div>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)' }}>
                    <div style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>AI Suggestion (Strong)</div>
                    <div style={{ color: '#f8fafc', fontFamily: 'monospace' }}>&quot;{item.suggested_fix}&quot;</div>
                    <div style={{ marginTop: '12px', color: '#94a3b8', fontSize: '0.9rem' }}>💡 <strong>Why:</strong> {item.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.atsKeywordsMissing.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ color: '#f8fafc', marginBottom: '16px', fontSize: '1.4rem' }}>Missing ATS Keywords</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {result.atsKeywordsMissing.map((kw: string, i: number) => (
                  <span key={i} style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '0.9rem' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.internshipMatches && result.internshipMatches.length > 0 && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', padding: '32px' }}>
              <h3 style={{ color: '#3b82f6', marginBottom: '8px', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>🎯</span> Top Live Matches
              </h3>
              <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '0.95rem' }}>
                Our Engine has cross-referenced your resume against the currently open positions. Here are your highest probability targets:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {result.internshipMatches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3).map((match, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '24px', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${getScoreColor(match.matchScore)}` }}>
                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: getScoreColor(match.matchScore) }}>{match.matchScore}%</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Match</div>
                    </div>
                    <div>
                      <div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{match.role}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '12px' }}>@ {match.company}</div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>{match.recommendation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
