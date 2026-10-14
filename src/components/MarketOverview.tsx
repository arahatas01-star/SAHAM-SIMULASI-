import React, { useState, useMemo } from 'react';
import { Stock } from '../types/market';
import {
  formatRupiah,
  formatCompactRupiah,
  formatPercent,
  formatNumber,
} from '../utils/formatters';
import { Search, TrendingUp, TrendingDown, Layers, Sparkles } from 'lucide-react';

interface MarketOverviewProps {
  stocks: Stock[];
  selectedTicker: string;
  onSelectStock: (ticker: string) => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  stocks,
  selectedTicker,
  onSelectStock,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('SEMUA');
  const [sortBy, setSortBy] = useState<'GAIN' | 'LOSS' | 'TURNOVER' | 'MARKET_CAP'>('TURNOVER');

  // Sectors list
  const sectors = useMemo(() => {
    const list = Array.from(new Set(stocks.map((s) => s.sector)));
    return ['SEMUA', ...list];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks
      .filter((s) => {
        const matchSearch =
          s.ticker.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase());
        const matchSector = selectedSector === 'SEMUA' || s.sector === selectedSector;
        return matchSearch && matchSector;
      })
      .sort((a, b) => {
        if (sortBy === 'GAIN') return b.changePercent - a.changePercent;
        if (sortBy === 'LOSS') return a.changePercent - b.changePercent;
        if (sortBy === 'TURNOVER') return b.turnover - a.turnover;
        if (sortBy === 'MARKET_CAP') return b.marketCap - a.marketCap;
        return 0;
      });
  }, [stocks, search, selectedSector, sortBy]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode saham (misal: BBCA, GOTO, BREN)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] text-slate-400 shrink-0 mr-1">Urutkan:</span>
          <button
            onClick={() => setSortBy('TURNOVER')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors shrink-0 ${
              sortBy === 'TURNOVER'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paling Aktif
          </button>
          <button
            onClick={() => setSortBy('GAIN')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors shrink-0 ${
              sortBy === 'GAIN'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top Gainer
          </button>
          <button
            onClick={() => setSortBy('LOSS')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors shrink-0 ${
              sortBy === 'LOSS'
                ? 'bg-slate-800 text-rose-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top Loser
          </button>
          <button
            onClick={() => setSortBy('MARKET_CAP')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors shrink-0 ${
              sortBy === 'MARKET_CAP'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Big Cap
          </button>
        </div>
      </div>

      {/* Sector Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {sectors.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSector(sec)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
              selectedSector === sec
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Stocks Horizontal Scroll / Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {filteredStocks.map((stock) => {
          const isSelected = stock.ticker === selectedTicker;
          const isUp = stock.change >= 0;
          const isAra = stock.price >= stock.araPrice;
          const isArb = stock.price <= stock.arbPrice;

          return (
            <button
              key={stock.ticker}
              onClick={() => onSelectStock(stock.ticker)}
              className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              {/* Top row: Ticker + badges */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-white group-hover:text-emerald-300 transition-colors">
                    {stock.ticker}
                  </span>
                  {isAra && (
                    <span className="text-[9px] font-bold px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">
                      ARA
                    </span>
                  )}
                  {isArb && (
                    <span className="text-[9px] font-bold px-1 py-0.2 bg-rose-500/20 text-rose-400 rounded">
                      ARB
                    </span>
                  )}
                </div>

                {/* Corporate action indicators */}
                <div className="flex items-center gap-1">
                  {stock.hasRightIssueActive && (
                    <span
                      title="Ada Right Issue (HMETD) Aktif!"
                      className="w-2 h-2 rounded-full bg-amber-400 animate-ping"
                    />
                  )}
                  {stock.hasDividendPending && (
                    <span
                      title="Ada Dividen Tunai Mendatang!"
                      className="w-2 h-2 rounded-full bg-sky-400"
                    />
                  )}
                </div>
              </div>

              {/* Company short name */}
              <p className="text-[10px] text-slate-400 truncate mb-2">
                {stock.name}
              </p>

              {/* Price and Change */}
              <div className="flex items-baseline justify-between gap-1">
                <span className="font-mono text-xs font-bold text-slate-100">
                  {formatNumber(stock.price)}
                </span>
                <span
                  className={`font-mono text-[11px] font-semibold flex items-center ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                  )}
                  {formatPercent(stock.changePercent)}
                </span>
              </div>

              {/* Turnover compact */}
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>Vol: {formatCompactRupiah(stock.turnover)}</span>
                <span className="text-[9px] text-slate-400">{stock.sector}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
