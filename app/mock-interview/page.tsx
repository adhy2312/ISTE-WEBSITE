'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isTextUIPart } from 'ai';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Send, RotateCcw, ChevronDown,
  Cpu, User, FileText, BookOpen
} from 'lucide-react';

const DOMAINS = [
  'AI/ML',
  'Web Development',
  'Cybersecurity',
  'Embedded Systems',
  'Data Engineering',
  'Mobile Development',
  'Robotics',
  'Cloud & DevOps',
  'General Software Engineering',
];

const DOMAIN_ICONS: Record<string, string> = {
  'AI/ML': '🧠',
  'Web Development': '🌐',
  'Cybersecurity': '🔐',
  'Embedded Systems': '⚙️',
  'Data Engineering': '📊',
  'Mobile Development': '📱',
  'Robotics': '🤖',
  'Cloud & DevOps': '☁️',
  'General Software Engineering': '💻',
};

function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  );
}

function getMessageText(msg: any): string {
  if (!msg.parts || msg.parts.length === 0) return '';
  return msg.parts
    .filter(isTextUIPart)
    .map((p: any) => p.text)
    .join('');
}

export default function MockInterviewPage() {
  const [domain, setDomain] = useState('General Software Engineering');
  const [resumeText, setResumeText] = useState('');
  const [showResumePanel, setShowResumePanel] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [domainOpen, setDomainOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/interview',
      body: { domain, resumeText: resumeText || undefined },
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text }] });
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetSession = () => {
    setMessages([]);
    setSessionStarted(false);
    setInputValue('');
  };

  if (!sessionStarted) {
    return (
      <div className="iv-setup-page">
        <div className="iv-bg-grid"></div>
        <div className="iv-bg-glow"></div>

        <header className="iv-setup-header">
          <Link href="/internships" className="iv-back-btn">
            <ArrowLeft size={16} />
            Back to Launchpad
          </Link>
          <div className="iv-brand">
            <Image src="/iste.png" alt="ISTE" width={32} height={32} />
            <span>ISTE MBCET</span>
          </div>
        </header>

        <div className="iv-setup-container">
          <div className="iv-setup-badge">
            <Cpu size={14} />
            AI-Powered
          </div>
          <h1 className="iv-setup-title">
            Mock Interview<br />
            <em>Engine</em>
          </h1>
          <p className="iv-setup-subtitle">
            A Gemini-powered interviewer that asks real technical questions, evaluates your answers, and helps you prepare for internship interviews.
          </p>

          {/* Domain Selector */}
          <div className="iv-field">
            <label className="iv-label">
              <BookOpen size={14} />
              Choose Your Domain
            </label>
            <div className="iv-dropdown-wrapper">
              <button
                className="iv-dropdown-btn"
                onClick={() => setDomainOpen(d => !d)}
              >
                <span>{DOMAIN_ICONS[domain]} {domain}</span>
                <ChevronDown size={16} style={{ transform: domainOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {domainOpen && (
                <div className="iv-dropdown-list">
                  {DOMAINS.map(d => (
                    <button
                      key={d}
                      className={`iv-dropdown-item ${d === domain ? 'active' : ''}`}
                      onClick={() => { setDomain(d); setDomainOpen(false); }}
                    >
                      <span>{DOMAIN_ICONS[d]}</span>
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resume Paste */}
          <div className="iv-field">
            <button
              className="iv-resume-toggle"
              onClick={() => setShowResumePanel(p => !p)}
            >
              <FileText size={14} />
              {showResumePanel ? 'Hide' : 'Add'} Resume Context (optional)
              <ChevronDown size={14} style={{ transform: showResumePanel ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {showResumePanel && (
              <textarea
                className="iv-resume-input"
                placeholder="Paste your resume text here... The AI will tailor questions to your background."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                rows={6}
              />
            )}
          </div>

          {/* Rules */}
          <div className="iv-rules">
            <div className="iv-rule"><span>01</span> One question at a time — answer thoroughly</div>
            <div className="iv-rule"><span>02</span> The AI provides feedback after each answer</div>
            <div className="iv-rule"><span>03</span> After 5-6 questions, you receive a final score</div>
          </div>

          <button
            className="iv-start-btn"
            onClick={() => {
              setSessionStarted(true);
              // Send initial kick-off message after render
              setTimeout(() => {
                sendMessage({ role: 'user', parts: [{ type: 'text', text: 'Begin the interview.' }] });
              }, 100);
            }}
          >
            Start Interview Session
            <span className="iv-start-arrow">→</span>
          </button>
        </div>

        <IVStyles />
      </div>
    );
  }

  return (
    <div className="iv-chat-page">
      <div className="iv-bg-grid"></div>
      <div className="iv-bg-glow"></div>

      {/* Chat Header */}
      <header className="iv-chat-header">
        <div className="iv-chat-header-left">
          <button className="iv-back-btn" onClick={resetSession}>
            <ArrowLeft size={16} />
            New Session
          </button>
          <div className="iv-session-info">
            <div className="iv-session-pulse"></div>
            <span className="iv-session-domain">{DOMAIN_ICONS[domain]} {domain}</span>
          </div>
        </div>
        <button className="iv-reset-btn" onClick={resetSession} title="Reset interview">
          <RotateCcw size={15} />
        </button>
      </header>

      {/* Messages */}
      <div className="iv-messages">
        {messages.length === 0 && !isLoading && (
          <div className="iv-empty-state">
            <div className="iv-empty-icon">🎯</div>
            <div className="iv-empty-title">Starting your {domain} interview…</div>
          </div>
        )}

        {messages.filter(m => m.role !== 'system').map((msg) => {
          const text = getMessageText(msg);
          if (!text && msg.role !== 'assistant') return null;
          return (
            <div key={msg.id} className={`iv-msg iv-msg--${msg.role}`}>
              <div className="iv-msg-avatar">
                {msg.role === 'assistant' ? <Cpu size={16} /> : <User size={16} />}
              </div>
              <div className="iv-msg-bubble">
                <div className="iv-msg-label">
                  {msg.role === 'assistant' ? 'Interviewer' : 'You'}
                </div>
                <div className="iv-msg-content">
                  {text
                    ? text.split('\n').map((line, j) => (
                        <p key={j} style={{ margin: j > 0 ? '8px 0 0' : '0' }}>{line}</p>
                      ))
                    : <TypingIndicator />
                  }
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="iv-msg iv-msg--assistant">
            <div className="iv-msg-avatar"><Cpu size={16} /></div>
            <div className="iv-msg-bubble">
              <div className="iv-msg-label">Interviewer</div>
              <div className="iv-msg-content"><TypingIndicator /></div>
            </div>
          </div>
        )}

        {error && (
          <div className="iv-error">
            Session error occurred. <button onClick={resetSession}>Start over →</button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="iv-input-bar">
        <div className="iv-input-form">
          <textarea
            ref={inputRef}
            className="iv-input"
            placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="iv-send-btn"
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="iv-input-hint">
          Powered by Google Gemini · For practice purposes only
        </div>
      </div>

      <IVStyles />
    </div>
  );
}

function IVStyles() {
  return (
    <style>{`
      .iv-setup-page, .iv-chat-page {
        min-height: 100dvh;
        background: var(--black);
        color: var(--white);
        font-family: 'Inter', sans-serif;
        position: relative;
        overflow-x: hidden;
      }

      .iv-bg-grid {
        position: fixed; inset: 0; z-index: 0; pointer-events: none;
        background-image:
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
        background-size: 40px 40px;
      }
      .iv-bg-glow {
        position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
        width: 800px; height: 600px; border-radius: 50%;
        background: radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%);
        z-index: 0; pointer-events: none;
      }

      .iv-setup-header {
        position: relative; z-index: 10;
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 32px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .iv-back-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: none; border: none; cursor: pointer;
        color: var(--g400); font-size: 0.85rem; text-decoration: none;
        transition: color 0.2s; font-family: inherit; padding: 0;
      }
      .iv-back-btn:hover { color: var(--white); }
      .iv-brand {
        display: flex; align-items: center; gap: 8px;
        font-size: 0.85rem; color: var(--g400); opacity: 0.6;
      }

      .iv-setup-container {
        position: relative; z-index: 10;
        max-width: 560px; margin: 0 auto;
        padding: 60px 24px 80px;
        display: flex; flex-direction: column; gap: 28px;
      }
      .iv-setup-badge {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(59,130,246,0.1);
        border: 1px solid rgba(59,130,246,0.25);
        color: #60a5fa;
        font-size: 0.7rem; font-family: var(--font-mono);
        letter-spacing: 0.1em; text-transform: uppercase;
        padding: 5px 12px; border-radius: 20px;
        width: fit-content;
      }
      .iv-setup-title {
        font-size: clamp(2.5rem, 6vw, 4rem);
        font-weight: 800; line-height: 1.05;
        letter-spacing: -0.03em; margin: 0;
      }
      .iv-setup-title em { color: #60a5fa; font-style: normal; }
      .iv-setup-subtitle {
        font-size: 1rem; color: var(--g300); line-height: 1.7; margin: 0;
      }

      .iv-field { display: flex; flex-direction: column; gap: 10px; }
      .iv-label {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 0.8rem; font-weight: 600; color: var(--g300);
        letter-spacing: 0.04em; text-transform: uppercase;
      }

      .iv-dropdown-wrapper { position: relative; }
      .iv-dropdown-btn {
        width: 100%; padding: 14px 16px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; color: var(--white);
        font-size: 1rem; font-family: inherit;
        cursor: pointer; text-align: left;
        display: flex; justify-content: space-between; align-items: center;
        transition: border-color 0.2s;
      }
      .iv-dropdown-btn:hover { border-color: rgba(59,130,246,0.4); }
      .iv-dropdown-list {
        position: absolute; top: calc(100% + 8px); left: 0; right: 0;
        background: #0d1117; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; overflow: hidden; z-index: 100;
        max-height: 280px; overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      }
      .iv-dropdown-item {
        width: 100%; padding: 12px 16px;
        background: none; border: none; cursor: pointer;
        color: var(--g300); font-size: 0.95rem; font-family: inherit;
        text-align: left; display: flex; align-items: center; gap: 10px;
        transition: background 0.15s, color 0.15s;
      }
      .iv-dropdown-item:hover { background: rgba(255,255,255,0.05); color: var(--white); }
      .iv-dropdown-item.active { background: rgba(59,130,246,0.1); color: #60a5fa; }

      .iv-resume-toggle {
        display: inline-flex; align-items: center; gap: 8px;
        background: none; border: 1px dashed rgba(255,255,255,0.12);
        border-radius: 10px; padding: 10px 16px;
        color: var(--g400); font-size: 0.85rem; font-family: inherit;
        cursor: pointer; transition: all 0.2s;
      }
      .iv-resume-toggle:hover { border-color: rgba(255,255,255,0.25); color: var(--white); }
      .iv-resume-input {
        width: 100%; padding: 14px 16px;
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px; color: var(--white);
        font-size: 0.9rem; font-family: var(--font-mono);
        resize: vertical; outline: none; line-height: 1.6;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }
      .iv-resume-input:focus { border-color: rgba(59,130,246,0.4); }
      .iv-resume-input::placeholder { color: var(--g600); }

      .iv-rules {
        display: flex; flex-direction: column; gap: 10px;
        padding: 20px; border-radius: 12px;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.05);
      }
      .iv-rule {
        display: flex; align-items: flex-start; gap: 12px;
        font-size: 0.85rem; color: var(--g300); line-height: 1.5;
      }
      .iv-rule span {
        font-family: var(--font-mono); font-size: 0.7rem;
        color: #3b82f6; flex-shrink: 0; padding-top: 2px;
      }

      .iv-start-btn {
        width: 100%; padding: 18px;
        background: #3b82f6;
        border: none; border-radius: 14px;
        color: white; font-size: 1.1rem; font-weight: 700;
        cursor: pointer; font-family: inherit;
        display: flex; align-items: center; justify-content: center; gap: 12px;
        transition: all 0.25s; box-shadow: 0 8px 24px rgba(59,130,246,0.3);
      }
      .iv-start-btn:hover {
        background: #2563eb;
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(59,130,246,0.4);
      }
      .iv-start-arrow { font-size: 1.3rem; }

      /* CHAT PAGE */
      .iv-chat-page {
        display: flex; flex-direction: column; height: 100dvh;
      }
      .iv-chat-header {
        position: relative; z-index: 10;
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        background: rgba(5,8,14,0.8);
        backdrop-filter: blur(12px);
        flex-shrink: 0;
      }
      .iv-chat-header-left { display: flex; align-items: center; gap: 20px; }
      .iv-session-info { display: flex; align-items: center; gap: 10px; }
      .iv-session-pulse {
        width: 7px; height: 7px; border-radius: 50%;
        background: #4ade80; box-shadow: 0 0 8px #4ade80;
        animation: heartbeat 1.5s infinite;
      }
      @keyframes heartbeat { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
      .iv-session-domain {
        font-family: var(--font-mono); font-size: 0.75rem;
        color: var(--g300); letter-spacing: 0.05em;
      }
      .iv-reset-btn {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        color: var(--g400); border-radius: 8px;
        width: 36px; height: 36px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.2s;
      }
      .iv-reset-btn:hover { background: rgba(255,255,255,0.1); color: var(--white); }

      .iv-messages {
        flex: 1; overflow-y: auto;
        padding: 24px;
        display: flex; flex-direction: column; gap: 20px;
        position: relative; z-index: 5;
      }
      .iv-messages::-webkit-scrollbar { width: 4px; }
      .iv-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

      .iv-empty-state {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 16px; text-align: center; padding: 60px 0;
      }
      .iv-empty-icon { font-size: 3rem; }
      .iv-empty-title { font-size: 1.2rem; font-weight: 600; color: var(--white); }

      .iv-msg {
        display: flex; gap: 14px; max-width: 780px;
        animation: slideUp 0.3s ease;
      }
      @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .iv-msg--assistant { align-self: flex-start; }
      .iv-msg--user { align-self: flex-end; flex-direction: row-reverse; }

      .iv-msg-avatar {
        width: 36px; height: 36px; border-radius: 10px;
        flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .iv-msg--assistant .iv-msg-avatar {
        background: rgba(59,130,246,0.15);
        border: 1px solid rgba(59,130,246,0.25);
        color: #60a5fa;
      }
      .iv-msg--user .iv-msg-avatar {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        color: var(--g300);
      }

      .iv-msg-bubble { display: flex; flex-direction: column; gap: 6px; }
      .iv-msg-label {
        font-family: var(--font-mono); font-size: 0.65rem;
        color: var(--g500); letter-spacing: 0.08em; text-transform: uppercase;
      }
      .iv-msg--user .iv-msg-label { text-align: right; }
      .iv-msg-content {
        padding: 14px 18px;
        border-radius: 14px;
        font-size: 0.95rem; line-height: 1.65;
      }
      .iv-msg--assistant .iv-msg-content {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.07);
        color: var(--g100);
        border-radius: 4px 14px 14px 14px;
      }
      .iv-msg--user .iv-msg-content {
        background: rgba(59,130,246,0.12);
        border: 1px solid rgba(59,130,246,0.2);
        color: #e2e8f0;
        border-radius: 14px 4px 14px 14px;
      }

      .typing-indicator {
        display: flex; gap: 4px; align-items: center; padding: 4px 0;
      }
      .typing-indicator span {
        width: 6px; height: 6px; border-radius: 50%;
        background: #60a5fa; opacity: 0.4;
        animation: typingBounce 1.2s ease-in-out infinite;
      }
      .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
      .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typingBounce {
        0%,60%,100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-6px); opacity: 1; }
      }

      .iv-error {
        padding: 12px 16px;
        background: rgba(248,113,113,0.1);
        border: 1px solid rgba(248,113,113,0.25);
        border-radius: 10px; color: #fca5a5;
        font-size: 0.85rem;
      }
      .iv-error button {
        background: none; border: none; cursor: pointer;
        color: #fca5a5; font-weight: 600; text-decoration: underline;
      }

      .iv-input-bar {
        position: relative; z-index: 10;
        padding: 16px 24px;
        border-top: 1px solid rgba(255,255,255,0.06);
        background: rgba(5,8,14,0.8);
        backdrop-filter: blur(12px);
        flex-shrink: 0;
      }
      .iv-input-form {
        display: flex; gap: 12px; align-items: flex-end;
        max-width: 780px; margin: 0 auto;
      }
      .iv-input {
        flex: 1; padding: 14px 16px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; color: var(--white);
        font-size: 0.95rem; font-family: inherit;
        resize: none; outline: none; line-height: 1.5;
        max-height: 160px; overflow-y: auto;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }
      .iv-input:focus { border-color: rgba(59,130,246,0.4); }
      .iv-input::placeholder { color: var(--g600); }
      .iv-input:disabled { opacity: 0.5; }
      .iv-send-btn {
        width: 48px; height: 48px; flex-shrink: 0;
        background: #3b82f6; border: none; border-radius: 12px;
        color: white; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s;
      }
      .iv-send-btn:hover:not(:disabled) { background: #2563eb; transform: scale(1.05); }
      .iv-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      .iv-input-hint {
        text-align: center; font-size: 0.7rem; color: var(--g600);
        font-family: var(--font-mono);
        max-width: 780px; margin: 8px auto 0;
      }

      @media (max-width: 640px) {
        .iv-setup-container { padding: 32px 20px 60px; }
        .iv-chat-header { padding: 12px 16px; }
        .iv-messages { padding: 16px; }
        .iv-input-bar { padding: 12px 16px; }
      }
    `}</style>
  );
}
