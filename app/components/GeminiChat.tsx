'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';

export default function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,255,255,0.2)] bg-black text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform hover:scale-110"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {isOpen ? '✕' : '✨'}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,10,0.95)] shadow-2xl backdrop-blur-xl sm:h-[550px] sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5 py-4 bg-[rgba(255,255,255,0.02)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-sm">
              ✨
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-white">ISTE Assistant</h3>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Powered by Gemini</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 font-sans text-sm">
            <div className="flex flex-col items-start gap-1">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[rgba(255,255,255,0.05)] px-4 py-3 leading-relaxed text-gray-200 border border-[rgba(255,255,255,0.02)]">
                Hello! I'm the ISTE MBCET AI assistant. Ask me anything about the chapter, our core pillars, or membership!
              </div>
            </div>

            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-tr-sm bg-white text-black font-medium'
                      : 'rounded-tl-sm bg-[rgba(255,255,255,0.05)] text-gray-200 border border-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col items-start gap-1">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[rgba(255,255,255,0.05)] px-4 py-3 text-gray-400">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[rgba(255,255,255,0.06)] p-4 bg-black">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about events or members..."
                className="flex-1 rounded-full border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-border focus:border-white font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
