
import React, { useState } from 'react';
import { CATEGORIES, DESTINATIONS, STEWARDSHIP_MATRIX, LEVEL_DEFINITIONS } from '../constants';
import { SupportLevel } from '../types';

const getLevelColor = (level: SupportLevel) => {
  const def = LEVEL_DEFINITIONS.find(d => d.level === level);
  return def?.colorClass || 'bg-slate-100 text-slate-800 border-slate-200';
};

export const MatrixTable: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.label.toLowerCase().includes(filter.toLowerCase()) || 
    cat.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Attribute Definitions Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Attribute Definitions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEVEL_DEFINITIONS.map(def => (
            <div key={def.level} className={`p-4 rounded-xl border ${def.colorClass} flex flex-col gap-1`}>
              <span className="font-black text-[10px] uppercase tracking-widest">{def.level}</span>
              <p className="text-xs leading-snug font-semibold mt-1">{def.definition}</p>
              <p className="text-[10px] italic opacity-80 mt-2">{def.guidance}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">DSS Stewardship Matrix</h2>
            <p className="text-sm text-slate-500 font-medium">Policy reference for corporate data placement.</p>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search category..."
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm w-full md:w-64 bg-slate-50 font-medium"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="p-5 font-bold text-slate-600 text-[11px] uppercase tracking-widest w-1/4">Data Category</th>
                {DESTINATIONS.map(dest => (
                  <th key={dest.id} className="p-5 font-bold text-slate-600 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl mb-1">{dest.icon}</span>
                      <span className="text-[10px] uppercase tracking-widest">{dest.name}</span>
                    </div>
                  </th>
                ))}
                <th className="p-5 font-bold text-slate-600 text-center text-[11px] uppercase tracking-widest">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(cat => {
                const recommendedEntry = STEWARDSHIP_MATRIX.find(e => e.categoryId === cat.id && e.level === 'Recommended');
                const recommendedTool = recommendedEntry ? DESTINATIONS.find(d => d.id === recommendedEntry.destinationId) : null;
                const isExpanded = expandedRow === cat.id;

                return (
                  <React.Fragment key={cat.id}>
                    <tr className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/50' : ''}`}
                        onClick={() => setExpandedRow(isExpanded ? null : cat.id)}>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <div className="font-bold text-slate-800 text-sm">{cat.label}</div>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 leading-tight ml-6">{cat.description}</div>
                      </td>
                      {DESTINATIONS.map(dest => {
                        const entry = STEWARDSHIP_MATRIX.find(e => e.categoryId === cat.id && e.destinationId === dest.id);
                        return (
                          <td key={dest.id} className="p-5 text-center align-top">
                            {entry ? (
                              <div className="flex flex-col items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border shadow-sm ${getLevelColor(entry.level)}`}>
                                  {entry.level.toUpperCase()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-200">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-5 text-center">
                        {recommendedTool ? (
                          <a 
                            href={recommendedTool.requestLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 uppercase tracking-tighter"
                          >
                            Request {recommendedTool.name}
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Manual Review</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={DESTINATIONS.length + 2} className="p-8">
                          <div className="grid md:grid-cols-4 gap-6 animate-fadeIn">
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                               <div>
                                 <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Policy Summary</h4>
                                 <div className={`text-sm font-bold ${cat.sensitivity === 'High' ? 'text-red-600' : 'text-slate-600'}`}>
                                   {cat.sensitivity} Security Level
                                 </div>
                               </div>
                               <p className="text-[10px] text-slate-500 mt-2">Subject to standard encryption and {cat.sensitivity} level audits.</p>
                             </div>
                             
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-1">
                               <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Recommended Destination</h4>
                               <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                 <span>{recommendedTool?.icon}</span>
                                 <span>{recommendedTool?.name || 'Manual Review'}</span>
                               </div>
                               <div className="text-[10px] font-medium text-blue-600 mt-1">Allocation: {recommendedTool?.allocation}</div>
                             </div>

                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2">
                               <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Cost Details (Chargeback Info)</h4>
                               <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                                 {recommendedTool?.fullCostDetails || 'No specific cost details available.'}
                               </p>
                               <div className="mt-3 text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                 </svg>
                                 Rule: &gt;5TB threshold triggers departmental billing.
                               </div>
                             </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
