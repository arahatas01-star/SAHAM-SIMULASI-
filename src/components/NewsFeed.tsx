import React, { useState } from 'react';
import { MarketNews, PortfolioHolding } from '../types/market';
import { Newspaper, TrendingUp, TrendingDown, Minus, Filter, ExternalLink } from 'lucide-react';

interface NewsFeedProps {
  news: MarketNews[];
  portfolio: PortfolioHolding[];
  currentDay: number;
  onSelectStock: (ticker: string) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  news,
  portfolio,
  currentDay,
  onSelectStock,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'MY_STOCKS' | 'BULLISH' | 'BEARISH'>('ALL');

  // Only show news up to currentDay
  const availableNews = news.filter((n) => n.day <= currentDay);

  const myTickers = portfolio.map((p) => p.ticker);

  const filteredNews = availableNews.filter((n) => {
    if (filter === 'MY_STOCKS') return n.relatedTicker && myTickers.includes(n.relatedTicker);
    if (filter === 'BULLISH') return n.sentiment === 'BULLISH';
    if (filter === 'BEARISH') return n.sentiment === 'BEARISH';
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header and Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-emerald-400" />
            Warta Pasar Modal & Analisis Sentimen Emiten
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Berita keuangan riil dari Bisnis.com, CNBC Indonesia, Kontan, & Keterbukaan Informasi IDX.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({availableNews.length})
          </button>
          <button
            onClick={() => setFilter('MY_STOCKS')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'MY_STOCKS'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Saham Portofolio Saya
          </button>
          <button
            onClick={() => setFilter('BULLISH')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'BULLISH'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bullish 🟢
          </button>
          <button
            onClick={() => setFilter('BEARISH')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'BEARISH'
                ? 'bg-slate-800 text-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bearish 🔴
          </button>
        </div>
      </div>

      {/* News Stream List */}
      <div className="flex flex-col gap-3">
        {filteredNews.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
            Tidak ada berita yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          filteredNews.map((item) => {
            const isBullish = item.sentiment === 'BULLISH';
            const isBearish = item.sentiment === 'BEARISH';

            const sentimentBadge = isBullish
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : isBearish
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700';

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col gap-2 transition-all"
              >
                {/* Meta Row: Source, Time, Day, Sentiment */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span className="font-semibold text-slate-200">{item.source}</span>
                    <span>·</span>
                    <span>Hari ke-{item.day}</span>
                    <span>·</span>
                    <span className="font-mono">{item.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sentiment Pill */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${sentimentBadge}`}
                    >
                      {isBullish ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : isBearish ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      <span>{item.sentiment}</span>
                    </span>

                    {/* Related Ticker Button */}
                    {item.relatedTicker && (
                      <button
                        onClick={() => onSelectStock(item.relatedTicker!)}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <span>Trade {item.relatedTicker}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Headline */}
                <h4 className="text-sm font-bold text-white leading-snug">
                  {item.title}
                </h4>

                {/* Snippet */}
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.snippet}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
