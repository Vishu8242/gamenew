import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ArrowUpDown, Calendar, Filter, Search, Trophy, Sparkles } from 'lucide-react';

export default function ResultHistory() {
  const { recentResults, loadingData } = useGame();

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Filtering Logic based on our schema fields
  const filtered = recentResults.filter((res) => {
    const matchesSearch = res.marketName.toLowerCase().includes(search.toLowerCase()) || 
                          (res.finalResult && res.finalResult.includes(search)) ||
                          (res.jodi && res.jodi.includes(search));
    const matchesDate = !filterDate || res.resultDate === filterDate;

    return matchesSearch && matchesDate;
  });

  return (
    <div id="results-history-page" className="space-y-6 pb-12">
      {/* Header card */}
      <div className="bg-gradient-to-r from-zinc-950 via-neutral-900 to-amber-955/15 border border-amber-500/20 p-6 rounded-2xl">
        <h2 className="font-serif text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-250 via-amber-350 to-amber-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
          <Trophy className="w-6.5 h-6.5 text-yellow-500" />
          OFFICIAL RESULT PANELS CHART
        </h2>
        <p className="text-xs text-neutral-400">
          Complete daily archive of open-and-close panels and Jodi digits across all listed rooms.
        </p>
      </div>

      {/* Interactive Filter Control bar */}
      <div className="p-4 bg-zinc-950 border border-amber-500/15 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Filter 1: Search name or finalResult */}
        <div>
          <label className="block text-[10px] uppercase font-mono text-amber-500/60 font-bold mb-1.5">
            Search keyword (Market / Number)
          </label>
          <div className="relative bg-zinc-900 border border-amber-500/10 focus-within:border-amber-400 rounded-lg overflow-hidden transition-all">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. KALYAN, 45, 120-45-789"
              className="w-full bg-transparent pl-9 pr-3 py-2 text-xs text-neutral-200 outline-none placeholder-zinc-700 font-mono"
            />
          </div>
        </div>

        {/* Filter 2: Date */}
        <div>
          <label className="block text-[10px] uppercase font-mono text-amber-500/60 font-bold mb-1.5">
            Declared Result Date
          </label>
          <div className="relative bg-zinc-900 border border-amber-500/10 rounded-lg overflow-hidden focus-within:border-amber-400 transition-all">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-transparent pl-9 pr-3 py-1.5 text-xs text-neutral-300 outline-none font-mono cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Results Table Listing */}
      <div className="bg-zinc-950 border border-amber-500/15 rounded-xl p-5 shadow-xl">
        {loadingData ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-neutral-400 font-mono mt-2">Opening files...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Market Room Name</th>
                  <th className="py-3 px-3 text-center">Open Panel</th>
                  <th className="py-3 px-3 text-center">Jodi (2D)</th>
                  <th className="py-3 px-3 text-center">Close Panel</th>
                  <th className="py-3 px-3 text-right">Combined Record</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono text-neutral-300">
                {filtered.map((res, idx) => (
                  <tr 
                    key={res.id || idx}
                    className="border-b border-neutral-900/40 hover:bg-neutral-900/10 transition-colors"
                  >
                    <td className="py-3.5 px-3 text-neutral-400">
                      {res.resultDate}
                    </td>
                    <td className="py-3.5 px-3 font-serif font-black text-neutral-200 uppercase tracking-wider">
                      {res.marketName}
                    </td>
                    <td className="py-3.5 px-3 text-center text-amber-500 font-bold">
                      {res.openPanel || '---'}
                    </td>
                    <td className="py-3.5 px-3 text-center text-yellow-300 font-serif text-sm font-black underline decoration-amber-500/20">
                      {res.jodi || '--'}
                    </td>
                    <td className="py-3.5 px-3 text-center text-amber-500 font-bold">
                      {res.closePanel || '---'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-serif text-sm font-black text-amber-400 tracking-wider">
                      {res.finalResult || `${res.openPanel || '???'}-${res.jodi || '??'}-${res.closePanel || '???'}`}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-neutral-500 italic">
                      No daily results matched your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
