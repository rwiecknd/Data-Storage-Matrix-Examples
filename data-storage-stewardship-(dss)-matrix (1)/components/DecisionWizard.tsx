
import React, { useState, useMemo, useEffect } from 'react';
import { DESTINATIONS } from '../constants';
import { StorageDestination } from '../types';

type Step = 'OWNERSHIP' | 'SENSITIVITY' | 'COLLABORATION' | 'RETENTION' | 'SIZE' | 'RESULT';

const FriendlinessStars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5" title={`${rating}/5 Usability Rating`}>
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i} className={`text-[10px] ${i < rating ? 'text-amber-400' : 'text-white/20'}`}>★</span>
    ))}
  </div>
);

export const DecisionWizard: React.FC = () => {
  const [step, setStep] = useState<Step>('OWNERSHIP');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Sync URL Params to State on Mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlStep = params.get('step') as Step;
      const urlView = params.get('view');
      const urlSelected = params.get('selected');
      const urlAnswers = params.get('ans');

      if (urlStep && ['OWNERSHIP', 'SENSITIVITY', 'COLLABORATION', 'RETENTION', 'SIZE', 'RESULT'].includes(urlStep)) {
        setStep(urlStep);
      }
      if (urlView) {
        setViewingId(urlView);
        setStep('RESULT');
      }
      if (urlSelected) {
        setSelectedResultId(urlSelected);
      }
      if (urlAnswers) {
        try {
          const parsed = JSON.parse(atob(urlAnswers));
          setAnswers(parsed);
        } catch (e) {
          console.warn("Could not parse shared answers", e);
        }
      }
    } catch (err) {
      console.error("URL initialization failed", err);
    }
  }, []);

  // Sync State to URL Params
  useEffect(() => {
    try {
      const params = new URLSearchParams();
      if (step !== 'OWNERSHIP') params.set('step', step);
      if (viewingId) params.set('view', viewingId);
      if (selectedResultId) params.set('selected', selectedResultId);
      
      if (Object.keys(answers).length > 0) {
        params.set('ans', btoa(JSON.stringify(answers)));
      }

      const queryString = params.toString();
      const newRelativePathQuery = window.location.pathname + (queryString ? '?' + queryString : '');
      window.history.replaceState(null, '', newRelativePathQuery);
    } catch (err) {
      // Ignored: replaceState might fail in some sandboxed environments
    }
  }, [step, viewingId, selectedResultId, answers]);

  const handleAnswer = (key: string, value: string, nextStep: Step) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setStep(nextStep);
  };

  const allRecommendations = useMemo(() => {
    const scored = DESTINATIONS.map(d => {
      let score = d.userFriendlyRating * 10; 
      let reason = "Standard institutional offering.";

      if (answers.OWNERSHIP === 'work') {
          if (d.id === 'sharepoint') score += 50;
          if (d.id === 'onedrive') score -= 20;
      }

      if (answers.SENSITIVITY === 'high') {
        if (d.id === 'sharepoint' || d.id === 'azure') {
          score += 100;
          reason = "Compliance prioritized: High sensitivity requires robust audit logs.";
        }
        if (d.id === 'google' || d.id === 'onedrive') {
          score -= 40;
        }
      }

      if (answers.COLLABORATION === 'active') {
        if (d.id === 'teams') { 
          score += 80; 
          reason = "Optimized for high-velocity internal project work."; 
        }
        if (d.id === 'google') score += 40;
      }

      if (answers.COLLABORATION === 'structured') {
        if (d.id === 'sharepoint') { 
          score += 80; 
          reason = "Institutional record keeping standard."; 
        }
      }

      if (answers.SIZE === 'enterprise') {
        if (d.id === 'azure') { 
          score += 150; 
          reason = "Cost-effective at massive scale (>5TB)."; 
        } else { 
          score -= 60; 
        }
      }

      return { dest: d, score, matchReason: reason };
    });

    return scored.sort((a, b) => b.score - a.score).map(s => ({ dest: s.dest, matchReason: s.matchReason }));
  }, [answers]);

  const currentlyViewing = useMemo(() => {
    if (!viewingId) return null;
    return allRecommendations.find(r => r.dest.id === viewingId) || null;
  }, [allRecommendations, viewingId]);

  const resetWizard = () => {
    setStep('OWNERSHIP');
    setAnswers({});
    setViewingId(null);
    setSelectedResultId(null);
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (e) {}
  };

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (e) {
      alert("Sharing link: " + window.location.href);
    }
  };

  const primaryChoice = allRecommendations[0];
  const secondaryChoices = allRecommendations.slice(1, 3);
  const otherOptions = allRecommendations.slice(3);

  return (
    <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white mb-8 border border-slate-700 transition-all duration-500 min-h-[500px]">
      <div className="max-w-5xl mx-auto">
        {step === 'OWNERSHIP' && (
          <div className="animate-fadeIn">
            <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 inline-block border border-indigo-500/30">Stewardship Step 1</span>
            <h3 className="text-3xl font-black mb-2">Who owns this data?</h3>
            <p className="text-slate-400 mb-8">Determines institutional policy accountability.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => handleAnswer('OWNERSHIP', 'work', 'SENSITIVITY')} className="bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl border border-slate-700 text-left transition-all group">
                <div className="font-bold text-xl mb-1 group-hover:text-indigo-400">Corporate / Dept</div>
                <div className="text-sm text-slate-400">Business assets, official records, or team project data.</div>
              </button>
              <button onClick={() => handleAnswer('OWNERSHIP', 'personal', 'RESULT')} className="bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl border border-slate-700 text-left transition-all group">
                <div className="font-bold text-xl mb-1 group-hover:text-indigo-400">Individual Work</div>
                <div className="text-sm text-slate-400">Personal drafts, resumes, or non-departmental items.</div>
              </button>
            </div>
          </div>
        )}

        {step === 'SENSITIVITY' && (
          <div className="animate-fadeIn">
            <button onClick={() => setStep('OWNERSHIP')} className="text-xs text-slate-500 hover:text-white mb-4 flex items-center gap-1">← Back</button>
            <h3 className="text-3xl font-black mb-2">Classification?</h3>
            <p className="text-slate-400 mb-8">Matches data type to security controls.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => handleAnswer('SENSITIVITY', 'high', 'COLLABORATION')} className="bg-rose-900/20 hover:bg-rose-900/30 p-6 rounded-2xl border border-rose-500/30 text-left transition-all">
                <div className="font-bold text-xl mb-1 text-rose-300">High (PII / HIPAA)</div>
                <div className="text-sm text-slate-400">SSNs, Patient IDs, or Export-controlled info.</div>
              </button>
              <button onClick={() => handleAnswer('SENSITIVITY', 'low', 'COLLABORATION')} className="bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl border border-slate-700 text-left transition-all">
                <div className="font-bold text-xl mb-1">Internal / Public</div>
                <div className="text-sm text-slate-400">General memos, public data, or non-sensitive drafts.</div>
              </button>
            </div>
          </div>
        )}

        {step === 'COLLABORATION' && (
          <div className="animate-fadeIn">
            <button onClick={() => setStep('SENSITIVITY')} className="text-xs text-slate-500 hover:text-white mb-4 flex items-center gap-1">← Back</button>
            <h3 className="text-3xl font-black mb-6">Collaboration Flow?</h3>
            <div className="grid gap-3">
              {['none', 'active', 'structured'].map(id => (
                <button key={id} onClick={() => handleAnswer('COLLABORATION', id, 'RETENTION')} className="bg-slate-800 hover:bg-slate-700 p-5 rounded-2xl border border-slate-700 text-left">
                  <div className="font-bold uppercase tracking-widest text-[10px] text-indigo-400 mb-1">{id}</div>
                  <div className="font-bold">
                    {id === 'none' ? 'Private Use' : id === 'active' ? 'Fast Team Iteration' : 'Structured Institutional records'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'RETENTION' && (
          <div className="animate-fadeIn">
            <button onClick={() => setStep('COLLABORATION')} className="text-xs text-slate-500 hover:text-white mb-4 flex items-center gap-1">← Back</button>
            <h3 className="text-3xl font-black mb-6">Archive Target?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => handleAnswer('RETENTION', 'temporary', 'SIZE')} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-left">
                <div className="font-bold text-xl">Project-Based</div>
                <div className="text-sm text-slate-400">Active for &lt; 2 years.</div>
              </button>
              <button onClick={() => handleAnswer('RETENTION', 'permanent', 'SIZE')} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-left">
                <div className="font-bold text-xl">Permanent</div>
                <div className="text-sm text-slate-400">Institutional records retention.</div>
              </button>
            </div>
          </div>
        )}

        {step === 'SIZE' && (
          <div className="animate-fadeIn">
            <button onClick={() => setStep('RETENTION')} className="text-xs text-slate-500 hover:text-white mb-4 flex items-center gap-1">← Back</button>
            <h3 className="text-3xl font-black mb-6">Data Footprint?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <button onClick={() => handleAnswer('SIZE', 'standard', 'RESULT')} className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center hover:bg-slate-700"><div className="font-bold text-lg">&lt;1TB</div></button>
              <button onClick={() => handleAnswer('SIZE', 'mid', 'RESULT')} className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center hover:bg-slate-700"><div className="font-bold text-lg">1-5TB</div></button>
              <button onClick={() => handleAnswer('SIZE', 'enterprise', 'RESULT')} className="bg-slate-800 p-6 rounded-xl border border-amber-500/50 text-center hover:bg-slate-700"><div className="font-bold text-lg text-amber-300">&gt;5TB</div></button>
            </div>
          </div>
        )}

        {step === 'RESULT' && (
          <div className="animate-fadeIn">
            {!viewingId ? (
              <div className="space-y-12">
                {/* Result Dashboard Top Bar */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/50">
                  <button onClick={() => setStep('SIZE')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 flex items-center gap-2 transition-all">
                    <span className="text-lg">←</span> Modify Last Answer
                  </button>
                  <button onClick={resetWizard} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-all bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Start Over
                  </button>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="bg-indigo-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-xl border border-indigo-400/50">
                    Primary Recommendation
                  </div>
                  <div className="text-8xl mb-6 bg-slate-800 p-10 rounded-[3rem] border border-slate-700 shadow-inner relative group transition-transform hover:scale-105">
                    {primaryChoice.dest.icon}
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-900 px-3 py-1 rounded-lg flex flex-col items-center justify-center font-black border-4 border-slate-900 shadow-xl">
                      <span className="text-[10px] leading-none">RANK</span>
                      <span className="text-xl leading-none">#1</span>
                    </div>
                  </div>
                  <h3 className="text-5xl font-black mb-4 tracking-tighter">{primaryChoice.dest.name}</h3>
                  <p className="text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed italic">"{primaryChoice.matchReason}"</p>
                  
                  <div className="mb-4 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Estimated Cost</span>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 rounded-full inline-block">
                      <span className="text-xs font-bold text-slate-200">{primaryChoice.dest.cost}: {primaryChoice.dest.pricingNotes}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button onClick={() => setViewingId(primaryChoice.dest.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all">
                      View Full Specifications
                    </button>
                    <button onClick={handleShare} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                      {copyStatus === 'copied' ? 'Link Copied!' : 'Share'}
                    </button>
                  </div>
                </div>

                {secondaryChoices.length > 0 && (
                  <div className="pt-12 border-t border-slate-800">
                    <h4 className="text-lg font-black uppercase text-slate-500 tracking-[0.2em] mb-10 text-center">Top Alternatives</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {secondaryChoices.map((alt, idx) => (
                        <div key={alt.dest.id} className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700 flex flex-col items-center text-center group hover:bg-slate-800 transition-all">
                          <div className="relative mb-6">
                             <span className="text-6xl block group-hover:scale-110 transition-transform">{alt.dest.icon}</span>
                             <div className="absolute -top-3 -left-3 bg-slate-700 text-slate-300 px-3 py-1 rounded-md text-[10px] font-black border border-slate-600 shadow-lg">
                                RANK #{idx + 2}
                             </div>
                          </div>
                          <div className="font-black text-2xl mb-1">{alt.dest.name}</div>
                          <p className="text-xs text-slate-500 mb-6 italic leading-relaxed">"{alt.matchReason}"</p>
                          
                          <div className="mt-auto w-full">
                            <div className="mb-4">
                               <span className="text-[9px] font-black uppercase text-emerald-500 tracking-tighter block">Cost Basis</span>
                               <span className="text-xs font-bold text-slate-400">{alt.dest.cost}</span>
                            </div>
                            <button onClick={() => setViewingId(alt.dest.id)} className="w-full bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                              Review Detail
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {otherOptions.length > 0 && (
                  <div className="pt-12">
                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-[0.2em] mb-6 text-center">Other Supported Platforms</h4>
                    <div className="grid gap-3">
                      {otherOptions.map((alt, idx) => (
                        <div key={alt.dest.id} className="bg-slate-800/20 p-4 rounded-2xl border border-slate-800 flex items-center justify-between group cursor-pointer hover:bg-slate-800/40" onClick={() => setViewingId(alt.dest.id)}>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{alt.dest.icon}</span>
                            <div>
                               <div className="font-black text-sm">{alt.dest.name}</div>
                               <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Rank #{idx + 4} • {alt.dest.allocation}</div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                             <div className="hidden sm:block">
                                <span className="text-[8px] font-black text-emerald-600 uppercase block">Cost</span>
                                <span className="text-[10px] font-bold text-slate-500">{alt.dest.cost}</span>
                             </div>
                             <button className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Specs →</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center pt-12">
                  <button onClick={resetWizard} className="px-10 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all text-slate-400">Restart Assessment</button>
                </div>
              </div>
            ) : currentlyViewing && (
              <div className="animate-fadeIn space-y-8">
                <div className="flex items-center justify-between gap-4">
                  <button onClick={() => setViewingId(null)} className="text-xs text-slate-500 hover:text-white flex items-center gap-2 group font-bold">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Comparison
                  </button>
                  <button onClick={handleShare} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                    {copyStatus === 'copied' ? 'Link Copied!' : 'Share Specifications'}
                  </button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                  <div className="text-8xl bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700">
                    {currentlyViewing.dest.icon}
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-4xl font-black mb-2 tracking-tight">{currentlyViewing.dest.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                      <div className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                        {currentlyViewing.dest.allocation}
                      </div>
                      <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                        {currentlyViewing.dest.cost}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-500">Usability</span>
                        <FriendlinessStars rating={currentlyViewing.dest.userFriendlyRating} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-slate-700">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">Implementation Overview</h4>
                      <p className="text-sm text-slate-300 leading-relaxed mb-6">{currentlyViewing.dest.detailedOverview}</p>
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700">
                        <span className="text-[10px] font-black text-emerald-400 uppercase block mb-1">Pricing Detail</span>
                        <p className="text-xs text-slate-400">{currentlyViewing.dest.pricingNotes}</p>
                      </div>
                    </div>
                    <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-slate-700">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-6">Governance Rules</h4>
                      <ul className="space-y-3">
                        {currentlyViewing.dest.governanceRules.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                            <span className="text-rose-500">✓</span><span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-slate-700">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">Best Applied For</h4>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {currentlyViewing.dest.bestFor.map((item, idx) => (
                          <span key={idx} className="bg-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-300 border border-slate-600">{item}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-slate-700 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Final Actions</h4>
                      <a href={currentlyViewing.dest.requestLink} target="_blank" className="w-full bg-white text-slate-900 py-4 rounded-2xl text-center font-black text-xs block shadow-xl hover:bg-slate-100 transition-all uppercase tracking-widest">
                        ServiceNow Request for {currentlyViewing.dest.name}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
