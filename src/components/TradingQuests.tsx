import React from 'react';
import { Quest } from '../types/market';
import { formatRupiah, formatNumber } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, CheckCircle2, Gift, X, Star } from 'lucide-react';

interface TradingQuestsProps {
  isOpen: boolean;
  quests: Quest[];
  onClose: () => void;
  onClaimReward: (questId: string) => void;
}

export const TradingQuests: React.FC<TradingQuestsProps> = ({
  isOpen,
  quests,
  onClose,
  onClaimReward,
}) => {
  if (!isOpen) return null;

  const handleClaim = (questId: string) => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if confetti fails
    }
    onClaimReward(questId);
  };

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Misi Cuan & Prestasi Trader
              </h3>
              <p className="text-xs text-slate-400">
                Selesaikan misi untuk mendapatkan tambahan modal saldo RDN! ({completedCount}/{quests.length} Selesai)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quests List */}
        <div className="p-5 overflow-y-auto flex flex-col gap-3">
          {quests.map((quest) => {
            const isCompleted = quest.completed;
            const isClaimed = quest.claimed;
            const progressPct = Math.min(
              100,
              Math.round((quest.progress / quest.maxProgress) * 100)
            );

            return (
              <div
                key={quest.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isClaimed
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/40 shadow-md shadow-emerald-950/30'
                    : 'bg-slate-950/70 border-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {isClaimed ? (
                        <CheckCircle2 className="w-4 h-4 text-slate-500" />
                      ) : isCompleted ? (
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ) : null}
                      <span>{quest.title}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {quest.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +{formatRupiah(quest.rewardCash)}
                    </span>
                    <span className="block text-[10px] text-amber-400 font-mono">
                      +{quest.xp} XP
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-400' : 'bg-sky-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {quest.maxProgress > 1000
                      ? `${progressPct}%`
                      : `${quest.progress}/${quest.maxProgress}`}
                  </span>
                </div>

                {/* Claim Button */}
                {isCompleted && !isClaimed && (
                  <button
                    onClick={() => handleClaim(quest.id)}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 animate-bounce transition-all"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Klaim Saldo Tunai {formatRupiah(quest.rewardCash)}</span>
                  </button>
                )}

                {isClaimed && (
                  <p className="mt-2 text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Hadiah sudah dikreditkan ke Saldo RDN</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
