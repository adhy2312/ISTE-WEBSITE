'use client'

import React, { useState, useEffect } from 'react';
import { Bot, X, Sparkles, Send } from 'lucide-react';
import { useBrain } from '../brain/BrainProvider';

export default function IsteAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([
    { role: 'ai', text: 'Hello! I am the ISTE Assistant. I know everything about our chapter, events, and membership. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const brain = useBrain();

  // Internship discoveries are tracked silently — no aggressive popups
  // The count is displayed as a subtle badge on the dock button only

  // Haptic feedback for the button
  const triggerHaptic = () => {
    brain.notifyEngine('Haptic', 'vibrate', { duration: 15 });
  };

  const handleToggle = () => {
    triggerHaptic();
    setIsOpen(!isOpen);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    triggerHaptic();
    
    const userText = input;
    const newMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    // Connect to Central Brain: Neural Engine Processing
    brain.notifyEngine('Neural', 'processing');
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      
      triggerHaptic();
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection to the Central Intelligence lost. Please try again." }]);
    } finally {
      setIsLoading(false);
      // Connect to Central Brain: Neural Engine Idle
      brain.notifyEngine('Neural', 'idle');
    }
  };

  return (
    <>
      {/* Floating Dock Button */}
      <button 
        onClick={handleToggle}
        className={`assistant-dock-btn ${isOpen ? 'active' : ''}`}
        aria-label="Toggle ISTE Assistant"
      >
        <Bot size={24} strokeWidth={1.5} />
      </button>

      {/* Assistant Panel */}
      <div className={`assistant-panel ${isOpen ? 'open' : ''}`}>
        <div className="assistant-header">
          <div className="assistant-title">
            <Sparkles size={16} className="assistant-icon" />
            ISTE Assistant
          </div>
          <button onClick={handleToggle} className="assistant-close"><X size={18} /></button>
        </div>
        
        <div className="assistant-body">
          {messages.map((msg, i) => (
            <div key={i} className={`assistant-msg ${msg.role === 'ai' ? 'ai-msg' : 'user-msg'}`}>
              {msg.text}
            </div>
          ))}
        </div>
        
        <form className="assistant-footer" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder={isLoading ? "Neural network processing..." : "Ask me anything..."} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="assistant-submit" disabled={!input.trim() || isLoading}>
            <Send size={16} />
          </button>
        </form>
      </div>

      <style jsx>{`
        .assistant-dock-btn {
          position: fixed;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          width: 44px;
          height: 120px;
          border-radius: 0 16px 16px 0;
          background: rgba(25, 25, 30, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-left: none;
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 9999;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 4px 0 24px rgba(0,0,0,0.6);
          transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1), background 0.3s;
        }
        .assistant-dock-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-50%) scaleX(1.1);
          transform-origin: left;
        }
        .assistant-dock-btn.active {
          transform: translateY(-50%) translateX(-100%);
          opacity: 0;
          pointer-events: none;
        }

        .assistant-panel {
          position: fixed;
          top: 0;
          left: 0;
          width: 380px;
          height: 100dvh;
          max-height: 100dvh;
          background: rgba(10, 10, 14, 0.95);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0;
          z-index: 9999;
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          box-shadow: 12px 0 40px rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: translateX(-100%);
          pointer-events: none;
          transition: opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1), transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .assistant-panel.open {
          opacity: 1;
          transform: translateX(0);
          pointer-events: all;
        }

        .assistant-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .assistant-title {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--white);
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
        }
        .assistant-icon { color: #ff512f; }
        .assistant-close {
          background: none; border: none; color: var(--g400); cursor: pointer; transition: color 0.3s;
        }
        .assistant-close:hover { color: var(--white); }

        .assistant-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .assistant-body::-webkit-scrollbar { width: 4px; }
        .assistant-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        
        .assistant-msg {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          line-height: 1.5;
          max-width: 85%;
        }
        .ai-msg {
          background: rgba(255, 255, 255, 0.05);
          color: var(--g200);
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        .user-msg {
          background: rgba(var(--c-main), 0.2);
          border: 1px solid rgba(var(--c-main), 0.3);
          color: var(--white);
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .assistant-footer {
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          gap: 12px;
        }
        .assistant-footer input {
          flex: 1;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--white);
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.3s;
        }
        .assistant-footer input:focus { border-color: rgba(var(--c-main), 0.5); }
        
        .assistant-submit {
          background: var(--white);
          color: var(--black);
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s;
        }
        .assistant-submit:hover:not(:disabled) {
          background: #e8eaed;
          transform: translateY(-2px);
        }
        .assistant-submit:disabled {
          background: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
          color: rgba(0,0,0,0.3);
        }

        @media (max-width: 768px) {
          .assistant-dock-btn {
            width: 32px;
            height: 80px;
            border-radius: 0 12px 12px 0;
          }
          .assistant-dock-btn svg {
            width: 20px;
            height: 20px;
          }
          .assistant-panel {
            width: min(85vw, 340px);
          }
        }
      `}</style>
    </>
  );
}
