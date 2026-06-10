'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Sparkles, Send, Cpu, Zap } from 'lucide-react';
import { useBrain } from '../brain/BrainProvider';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function IsteAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([
    { role: 'ai', text: 'Hello! I am the ISTE Assistant. I know everything about our chapter, events, and membership. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const brain = useBrain();
  
  const panelRef = useRef<HTMLDivElement>(null);
  const dockBtnRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useGSAP(() => {
    // Pulse animation for the dock button when closed
    if (!isOpen && dockBtnRef.current) {
      gsap.to(dockBtnRef.current, {
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
        yoyo: true,
        repeat: -1,
        duration: 1.5,
        ease: 'sine.inOut'
      });
    }

    if (isOpen && panelRef.current) {
      gsap.fromTo(panelRef.current, 
        { x: -50, opacity: 0, scale: 0.95 }, 
        { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  // Haptic feedback for the button
  const triggerHaptic = () => {
    brain.notifyEngine('Haptic', 'vibrate', { duration: 15 });
  };

  const handleToggle = () => {
    triggerHaptic();
    setIsOpen(!isOpen);
  };

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
        ref={dockBtnRef}
        onClick={handleToggle}
        className={`assistant-dock-btn ${isOpen ? 'active' : ''}`}
        aria-label="Toggle ISTE Assistant"
      >
        <div className="dock-icon-wrapper">
          <Bot size={28} strokeWidth={1.5} color="#e0e7ff" />
          <div className="dock-glow"></div>
        </div>
      </button>

      {/* Assistant Panel */}
      <div ref={panelRef} className={`assistant-panel ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="assistant-header">
          <div className="assistant-title">
            <div className="title-icon-wrapper">
              <Zap size={16} className="assistant-icon" fill="#3b82f6" color="#3b82f6" />
            </div>
            <span>ISTE Digital Soul</span>
          </div>
          <button onClick={handleToggle} className="assistant-close"><X size={20} /></button>
        </div>
        
        {/* Chat Body */}
        <div className="assistant-body">
          <div className="chat-welcome">
            <Cpu size={24} color="#64748b" />
            <p>Neural Network Initialized</p>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={`assistant-msg-wrapper ${msg.role === 'ai' ? 'wrapper-ai' : 'wrapper-user'}`}>
              {msg.role === 'ai' && (
                <div className="msg-avatar">
                  <Bot size={14} color="#3b82f6" />
                </div>
              )}
              <div className={`assistant-msg ${msg.role === 'ai' ? 'ai-msg' : 'user-msg'}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="assistant-msg-wrapper wrapper-ai">
              <div className="msg-avatar">
                <Sparkles size={14} color="#8b5cf6" className="spin-fast" />
              </div>
              <div className="assistant-msg ai-msg typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Footer Input */}
        <form className="assistant-footer" onSubmit={handleSubmit}>
          <div className="input-container">
            <input 
              type="text" 
              placeholder={isLoading ? "Processing query..." : "Ask me anything..."} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              autoFocus={isOpen}
            />
            <button type="submit" className={`assistant-submit ${input.trim() ? 'active-submit' : ''}`} disabled={!input.trim() || isLoading}>
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        /* DOCK BUTTON */
        .assistant-dock-btn {
          position: fixed;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          width: 60px;
          height: 100px;
          border-radius: 0 24px 24px 0;
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-left: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 9999;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 10px 0 30px rgba(0,0,0,0.5);
          transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          overflow: hidden;
        }
        .assistant-dock-btn:hover {
          width: 68px;
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 1));
          border-color: rgba(59, 130, 246, 0.6);
        }
        .assistant-dock-btn.active {
          transform: translateY(-50%) translateX(-100%);
          opacity: 0;
          pointer-events: none;
        }

        .dock-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dock-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
          filter: blur(8px);
          z-index: -1;
        }

        /* PANEL */
        .assistant-panel {
          position: fixed;
          top: 0;
          left: 0;
          width: 400px;
          height: 100dvh;
          max-height: 100dvh;
          background: rgba(15, 23, 42, 0.85);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 9999;
          backdrop-filter: blur(30px) saturate(200%);
          -webkit-backdrop-filter: blur(30px) saturate(200%);
          box-shadow: 20px 0 50px rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: translateX(-100%);
          pointer-events: none;
          visibility: hidden;
        }
        .assistant-panel.open {
          opacity: 1;
          transform: translateX(0);
          pointer-events: all;
          visibility: visible;
        }

        /* HEADER */
        .assistant-header {
          padding: 20px 24px;
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, transparent 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .assistant-title {
          font-family: var(--font-mono, monospace);
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .title-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .assistant-close {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .assistant-close:hover { 
          color: #ef4444; 
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
        }

        /* BODY */
        .assistant-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .assistant-body::-webkit-scrollbar { width: 6px; }
        .assistant-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        
        .chat-welcome {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          opacity: 0.6;
        }
        .chat-welcome p {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          margin: 0;
        }

        .assistant-msg-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          max-width: 90%;
        }
        .wrapper-ai { align-self: flex-start; }
        .wrapper-user { align-self: flex-end; flex-direction: row-reverse; }

        .msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .assistant-msg {
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.6;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .ai-msg {
          background: rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom-left-radius: 4px;
        }
        .user-msg {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #ffffff;
          border: 1px solid rgba(59, 130, 246, 0.5);
          border-bottom-right-radius: 4px;
        }

        /* TYPING INDICATOR */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 18px 20px;
        }
        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: #3b82f6;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .spin-fast { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* FOOTER */
        .assistant-footer {
          padding: 24px;
          background: linear-gradient(0deg, rgba(15, 23, 42, 1) 0%, transparent 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .input-container {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 6px 6px 6px 16px;
          transition: all 0.3s ease;
        }
        .input-container:focus-within {
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .assistant-footer input {
          flex: 1;
          background: transparent;
          border: none;
          color: #f8fafc;
          font-size: 0.95rem;
          outline: none;
        }
        .assistant-footer input::placeholder { color: #64748b; }
        
        .assistant-submit {
          background: rgba(255, 255, 255, 0.05);
          color: #64748b;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .assistant-submit.active-submit {
          background: #3b82f6;
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
        .assistant-submit.active-submit:hover:not(:disabled) {
          background: #2563eb;
          transform: scale(1.05);
        }
        .assistant-submit:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .assistant-dock-btn {
            width: 40px;
            height: 80px;
            border-radius: 0 16px 16px 0;
          }
          .assistant-panel {
            width: 100dvw;
            border-right: none;
          }
        }
      `}</style>
    </>
  );
}
