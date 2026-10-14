import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Award,
  Sparkles,
  Calendar,
  Clock,
  Wallet,
  PieChart,
  ArrowRight,
} from 'lucide-react';
import {
  formatRupiah,
  formatCompactRupiah,
  formatPercent,
} from '../utils/formatters';
import { getRankForEquity } from '../data/initialQuests';
import { Quest } from '../types/market';

interface HeaderProps {
  cashBalance: number;
  stockValue: number;
  totalEquity: number;
  floatingProfit: number;
  floatingProfitPercent: number;
  ihsgData: { value: number; change: number; changePercent: number };
  currentDay: number;
  sessionTime: string;
  simSpeed: 'pause' | '1x' | '2x' | '5x';
  soundEnabled: boolean;
  quests: Quest[];
  onSetSimSpeed: (speed: 'pause' | '1x' | '2x' | '5x') => void;
  onAdvanceDay: () => void;
  onToggleSound: () => void;
  onOpenQuests: () => void;
  onResetGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cashBalance,
  stockValue,
  totalEquity,
  floatingProfit,
  floatingProfitPercent,
  ihsgData,
  currentDay,
  sessionTime,
  simSpeed,
  soundEnabled,
  quests,
  onSetSimSpeed,
  onAdvanceDay,
  onToggleSound,
  onOpenQuests,
  onResetGame,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const currentRank = getRankForEquity(totalEquity);
  const unclaimedQuests = quests.filter((q) => q.completed && !q.claimed).length;

  const isProfit = floatingProfit >= 0;
  const isIhsgUp = ihsgData.change >= 0;

  return (
    <header className="bg-slate-900 border-b border-slate-800/80 sticky top-0 z-40">
      {/* Top Bar: IDX Status & Simulation Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/50">
        {/* Brand & Market Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
              IDX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Cuan Simulator
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  BEI LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Game Edukasi Trading Saham Indonesia
              </p>
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-800 mx-1" />

          {/* IHSG Realtime Ticker */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80 text-xs">
            <span className="text-slate-400 font-semibold">IHSG</span>
            <span className="font-mono font-bold text-slate-200">
              {ihsgData.value.toFixed(2)}
            </span>
            <span
              className={`flex items-center text-[11px] font-mono font-semibold ${
                isIhsgUp ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isIhsgUp ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {formatPercent(ihsgData.changePercent)}
            </span>
          </div>

          {/* Day & Session Clock */}
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-white">Hari ke-{currentDay}</span>
            <span className="text-slate-500">·</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-slate-300 text-[11px]">{sessionTime}</span>
          </div>
        </div>

        {/* Controls: Speed, Advance Day, Quests, Sound, Reset */}
        <div className="flex items-center gap-2">
          {/* Simulation Speed segmented buttons */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onSetSimSpeed('pause')}
              title="Pause Simulasi"
              className={`p-1.5 rounded transition-colors ${
                simSpeed === 'pause'
                  ? 'bg-slate-800 text-amber-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSetSimSpeed('1x')}
              title="Kecepatan Normal (1x)"
              className={`px-2 py-1 text-xs rounded transition-colors font-mono ${
                simSpeed === '1x'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => onSetSimSpeed('2x')}
              title="Kecepatan Cepat (2x)"
              className={`px-2 py-1 text-xs rounded transition-colors font-mono ${
                simSpeed === '2x'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => onSetSimSpeed('5x')}
              title="Kecepatan Super Cepat (5x)"
              className={`px-2 py-1 text-xs rounded transition-colors font-mono ${
                simSpeed === '5x'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5x
            </button>
          </div>

          {/* Next Day Trigger */}
          <button
            onClick={onAdvanceDay}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-950 transition-all active:scale-95"
            title="Lompat ke Hari Perdagangan Berikutnya (Proses Dividen & Right Issue)"
          >
            <span>Hari Berikutnya</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>

          {/* Quests / Misi Cuan */}
          <button
            onClick={onOpenQuests}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 text-xs font-medium rounded-lg border border-amber-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Misi Cuan</span>
            {unclaimedQuests > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unclaimedQuests}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara Efek'}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset Game ke Awal"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Financial Metrics Portfolio HUD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 items-center">
        {/* RDN Cash Balance */}
        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Kas RDN
            </p>
            <p className="font-mono text-xs sm:text-sm font-bold text-slate-100 truncate">
              {formatRupiah(cashBalance)}
            </p>
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <PieChart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Portofolio Saham
            </p>
            <p className="font-mono text-xs sm:text-sm font-bold text-slate-100 truncate">
              {formatRupiah(stockValue)}
            </p>
          </div>
        </div>

        {/* Total Equity */}
        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Total Ekuitas Akun
            </p>
            <p className="font-mono text-xs sm:text-sm font-bold text-emerald-400 truncate">
              {formatRupiah(totalEquity)}
            </p>
          </div>
        </div>

        {/* Floating P/L */}
        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              isProfit
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {isProfit ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Floating Profit/Loss
            </p>
            <div className="flex items-baseline gap-1 truncate">
              <span
                className={`font-mono text-xs sm:text-sm font-bold ${
                  isProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatRupiah(floatingProfit)}
              </span>
              <span
                className={`font-mono text-[10px] font-semibold ${
                  isProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                ({formatPercent(floatingProfitPercent)})
              </span>
            </div>
          </div>
        </div>

        {/* Trader Rank */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Peringkat Trader
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-300 truncate">
                {currentRank.title}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                (Lv.{currentRank.level})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Reset Simulasi Trading?
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Tindakan ini akan menghapus semua riwayat transaksi, portofolio, dan mengembalikan saldo awal Anda ke Rp 20.000.000 (Hari ke-1).
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onResetGame();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Ya, Reset Game
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
