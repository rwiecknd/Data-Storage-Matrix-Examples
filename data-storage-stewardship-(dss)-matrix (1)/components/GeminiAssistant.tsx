
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { STEWARDSHIP_MATRIX, CATEGORIES, DESTINATIONS, LEVEL_DEFINITIONS } from '../constants';

export const GeminiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your Data Storage Stewardship (DSS) Expert. Ask me anything about where to store specific types of data based on our institutional policies." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const matrixContext = JSON.stringify({
        matrix: STEWARDSHIP_MATRIX,
        categories: CATEGORIES,
        destinations: DESTINATIONS,
        definitions: LEVEL_DEFINITIONS
      });

      // Initialize AI instance here to prevent top-level 'process' reference errors
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `You are a Data Stewardship Expert. You manage the DSS Matrix which dictates where data must be stored for the entire university.
          Use the following context: ${matrixContext}
          RULES:
          1. Use the 'Definitions' to explain the meaning of your recommendations (e.g., 'Recommended' means primary, 'Case-by-Case' means consult IT).
          2. Always prioritize compliance and security.
          3. If the user mentions legacy storage (like Box or personal drives), inform them that our primary institutional storage solutions are OneDrive, SharePoint, and Teams, and they should follow standard stewardship protocols for data placement.
          4. Be professional, direct, and helpful.`,
        }
      });

      const text = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the DSS policy engine. Please check your network or try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <h3 className="font-bold text-slate-700 text-sm">DSS Smart Assistant</h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
            }`}>
              <div className="text-xs leading-relaxed whitespace-pre-wrap font-medium">{m.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about storage policies..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-xs"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
