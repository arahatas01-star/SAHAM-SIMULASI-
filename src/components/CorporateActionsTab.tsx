import React, { useState } from 'react';
import { CorporateAction, PortfolioHolding, Stock } from '../types/market';
import {
  formatRupiah,
  formatNumber,
} from '../utils/formatters';
import {
  Calendar,
  Gift,
  Split,
  Coins,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CorporateActionsTabProps {
  corporateActions: CorporateAction[];
  portfolio: PortfolioHolding[];
  stocks: Stock[];
  currentDay: number;
}

export const CorporateActionsTab: React.FC<CorporateActionsTabProps> = ({
  corporateActions,
  portfolio,
  stocks,
  currentDay,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredActions = corporateActions.filter((ca) => {
    if (filterType === 'ALL') return true;
    return ca.type === filterType;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Jadwal Aksi Korporasi Bursa Efek Indonesia
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau jadwal Dividen Tunai, Stock Split, Saham Bonus, dan HMETD.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'ALL'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua Aksi
          </button>
          <button
            onClick={() => setFilterType('DIVIDEND')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'DIVIDEND'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dividen Tunai
          </button>
          <button
            onClick={() => setFilterType('STOCK_SPLIT')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'STOCK_SPLIT'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stock Split
          </button>
          <button
            onClick={() => setFilterType('RIGHT_ISSUE')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'RIGHT_ISSUE'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Right Issue
          </button>
        </div>
      </div>

      {/* List of Corporate Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActions.map((ca) => {
          const userHolding = portfolio.find((p) => p.ticker === ca.ticker);
          const stock = stocks.find((s) => s.ticker === ca.ticker);

          // Determine current phase
          let phaseBadge = '';
          let phaseColor = '';

          if (currentDay < ca.cumDate) {
            phaseBadge = `Menuju Cum Date (${ca.cumDate - currentDay} hari lagi)`;
            phaseColor = 'text-sky-400 bg-sky-500/10 border-sky-500/30';
          } else if (currentDay === ca.cumDate) {
            phaseBadge = 'Hari Ini Cum Date! (Beli sebelum tutup)';
            phaseColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40 animate-pulse';
          } else if (currentDay >= ca.exDate && currentDay < ca.paymentDate) {
            phaseBadge = `Periode Ex Date (Cair Hari ke-${ca.paymentDate})`;
            phaseColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
          } else {
            phaseBadge = 'Selesai / Terdistribusi';
            phaseColor = 'text-slate-400 bg-slate-800/80 border-slate-700';
          }

          const IconComponent =
            ca.type === 'DIVIDEND'
              ? Gift
              : ca.type === 'STOCK_SPLIT'
              ? Split
              : Coins;

          return (
            <div
              key={ca.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header: Ticker, Type badge, and Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 font-extrabold text-xs">
                      {ca.ticker}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {ca.ticker} · {stock?.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {ca.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${phaseColor}`}
                  >
                    {phaseBadge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-semibold mb-1">
                  {ca.title}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {ca.description}
                </p>

                {/* Timeline Stepper */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 text-[11px] font-mono mb-3">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px]">1. Cum Date</span>
                    <span className={`font-bold ${currentDay >= ca.cumDate ? 'text-emerald-400' : 'text-slate-200'}`}>
                      Hari ke-{ca.cumDate}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px]">2. Ex Date</span>
                    <span className={`font-bold ${currentDay >= ca.exDate ? 'text-amber-400' : 'text-slate-200'}`}>
                      Hari ke-{ca.exDate}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px]">3. Payment Date</span>
                    <span className={`font-bold ${currentDay >= ca.paymentDate ? 'text-emerald-400' : 'text-slate-200'}`}>
                      Hari ke-{ca.paymentDate}
                    </span>
                  </div>
                </div>

                {/* Specific Action Metric */}
                <div className="flex items-center gap-2 text-xs">
                  {ca.type === 'DIVIDEND' && ca.dividendAmount && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-1 rounded">
                      <span>Dividen: Rp {formatNumber(ca.dividendAmount)} / lembar</span>
                    </div>
                  )}
                  {ca.type === 'STOCK_SPLIT' && ca.splitRatio && (
                    <div className="flex items-center gap-1.5 text-sky-400 font-mono font-bold bg-sky-500/10 px-2 py-1 rounded">
                      <span>Rasio Split: 1 : {ca.splitRatio.new}</span>
                    </div>
                  )}
                  {ca.type === 'RIGHT_ISSUE' && ca.rightRatio && (
                    <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-1 rounded">
                      <span>Rasio {ca.rightRatio.old}:{ca.rightRatio.new} @ Rp {formatNumber(ca.rightIssuePrice || 0)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* User Impact Box (if holding shares) */}
              <div className="mt-3 pt-3 border-t border-slate-800">
                {userHolding && userHolding.lots > 0 ? (
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-2.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Estimasi Dampak Portofolio Anda</span>
                    </div>
                    <p className="text-slate-300">
                      Anda memiliki <strong>{userHolding.lots} Lot ({formatNumber(userHolding.lots * 100)} lembar)</strong> saham {ca.ticker}.
                    </p>
                    {ca.type === 'DIVIDEND' && ca.dividendAmount && (
                      <p className="text-emerald-300 font-mono font-bold mt-0.5">
                        Potensi Kas Masuk: {formatRupiah(userHolding.lots * 100 * ca.dividendAmount)} pada Hari ke-{ca.paymentDate}!
                      </p>
                    )}
                    {ca.type === 'STOCK_SPLIT' && ca.splitRatio && (
                      <p className="text-sky-300 font-mono font-bold mt-0.5">
                        Saham Anda akan menjadi: {userHolding.lots * ca.splitRatio.new} Lot setelah Ex Date!
                      </p>
                    )}
                    {ca.type === 'RIGHT_ISSUE' && ca.rightRatio && (
                      <p className="text-amber-300 font-mono font-bold mt-0.5">
                        Anda akan menerima: {Math.floor((userHolding.lots * ca.rightRatio.new) / ca.rightRatio.old)} Lot HMETD ({ca.ticker}-R)!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Anda belum memiliki saham {ca.ticker}.</span>
                    <span className="text-[10px] text-slate-400">
                      Beli sebelum Cum Date untuk berhak.
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edukasi Singkat Glosarium Istilah BEI */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          Kamus Singkat Aksi Korporasi Bursa Efek Indonesia
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400 leading-relaxed">
          <div>
            <strong className="text-slate-200 block mb-0.5">Cum Date (Cumulative Date)</strong>
            Hari terakhir perdagangan di mana investor yang membeli atau memegang saham masih berhak mendapatkan dividen atau HMETD.
          </div>
          <div>
            <strong className="text-slate-200 block mb-0.5">Ex Date (Expired Date)</strong>
            Hari pertama perdagangan di mana pembeli saham baru sudah tidak lagi berhak atas aksi korporasi. Harga saham biasanya mengalami koreksi teknikal (dividend trap).
          </div>
          <div>
            <strong className="text-slate-200 block mb-0.5">Payment Date (Tanggal Bayar)</strong>
            Hari pencairan dana tunai dividen masuk secara otomatis ke Rekening Dana Nasabah (RDN) pemegang saham.
          </div>
        </div>
      </div>
    </div>
  );
};
