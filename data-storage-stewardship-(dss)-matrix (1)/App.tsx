
import React from 'react';
import { MatrixTable } from './components/MatrixTable';
import { DecisionWizard } from './components/DecisionWizard';
import { GeminiAssistant } from './components/GeminiAssistant';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Platform Neutral Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">S</div>
            <div>
              <span className="font-black text-lg text-white tracking-tighter block leading-none uppercase">Stewardship</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Decision Matrix v2.5</span>
            </div>
          </div>
          <div className="hidden md:flex gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <a href="#wizard" className="hover:text-white transition-colors">Navigator</a>
            <a href="#matrix" className="hover:text-white transition-colors">Policy Matrix</a>
            <a href="#support" className="hover:text-white transition-colors">AI Expert</a>
          </div>
          <div className="bg-slate-800 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-400 border border-slate-700 uppercase">
            Campus-Wide Governance
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Modern Header Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
                Data Storage <span className="text-indigo-600 underline decoration-indigo-200">Governance.</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                A comprehensive guide to help you find the right institutional home for your data. 
                Aligned with Security, Legal, and University Stewardship policies.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex -space-x-3">
                  {['👤', '🏢', '💬', '📂', '☁️'].map((icon, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-sm shadow-sm">{icon}</div>
                  ))}
               </div>
               <div className="text-[10px] font-black uppercase text-slate-400 leading-tight">Supported<br/>Platforms</div>
            </div>
          </div>
        </section>

        {/* Wizard Section */}
        <section id="wizard" className="mb-24 scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-1 bg-indigo-600 rounded-full"></div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">01. Data Storage Matrix Wizard</h2>
          </div>
          <DecisionWizard />
        </section>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Matrix Section */}
          <div className="lg:col-span-8 space-y-12">
            <section id="matrix" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">02. Policy Matrix</h2>
              </div>
              <MatrixTable />
            </section>
          </div>

          {/* AI/Sidebar Section */}
          <div className="lg:col-span-4 space-y-12">
            <section id="support" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-1 bg-emerald-600 rounded-full"></div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">03. Policy Chat</h2>
              </div>
              <GeminiAssistant />
            </section>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
              <h3 className="font-black text-2xl mb-4 tracking-tight">Need an Exception?</h3>
              <p className="text-sm text-slate-400 mb-8 font-medium leading-relaxed">
                Standard policies don't cover every research scenario. If you require specialized cloud configuration or custom exceptions, request a review.
              </p>
              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all shadow-xl">
                ServiceNow Governance Ticket
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-16 text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">DSS</div>
            <div>
               <span className="text-slate-300 text-sm font-black uppercase tracking-widest block">Stewardship Council</span>
               <span className="text-[10px] font-bold">Official Governance Platform</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Security Standards</a>
            <a href="#" className="hover:text-white transition-colors">Audit Logs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
