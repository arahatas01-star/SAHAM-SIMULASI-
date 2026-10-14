import React, { useState } from 'react';
import {
  RightIssueHolding,
  CorporateAction,
  Stock,
} from '../types/market';
import {
  formatRupiah,
  formatNumber,
  formatPercent,
  calculateTheoreticalRightPrice,
  calculateDilution,
} from '../utils/formatters';
import {
  Coins,
  ArrowRightLeft,
  AlertTriangle,
  HelpCircle,
  Calculator,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';

interface RightIssueCenterProps {
  rightHoldings: RightIssueHolding[];
  corporateActions: CorporateAction[];
  stocks: Stock[];
  cashBalance: number;
  currentDay: number;
  onExercise: (rightCode: string, lots: number) => { success: boolean; message: string };
  onSellRight: (rightCode: string, lots: number, price: number) => { success: boolean; message: string };
  onBuyRight: (rightCode: string, lots: number, price: number) => { success: boolean; message: string };
}

export const RightIssueCenter: React.FC<RightIssueCenterProps> = ({
  rightHoldings,
  corporateActions,
  stocks,
  cashBalance,
  currentDay,
  onExercise,
  onSellRight,
  onBuyRight,
}) => {
  // Calculator State
  const [calcCumPrice, setCalcCumPrice] = useState<number>(68);
  const [calcExercisePrice, setCalcExercisePrice] = useState<number>(50);
  const [calcOldRatio, setCalcOldRatio] = useState<number>(100);
  const [calcNewRatio, setCalcNewRatio] = useState<number>(25);

  // Active modal or action
  const [selectedHolding, setSelectedHolding] = useState<RightIssueHolding | null>(null);
  const [actionType, setActionType] = useState<'EXERCISE' | 'SELL' | null>(null);
  const [actionLots, setActionLots] = useState<number>(1);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Secondary Market purchase
  const [buyTargetAction, setBuyTargetAction] = useState<CorporateAction | null>(null);
  const [buyRightsLots, setBuyRightsLots] = useState<number>(10);

  // Calculate Theoretical Right values
  const theoreticalPrice = calculateTheoreticalRightPrice(
    calcCumPrice,
    calcExercisePrice,
    calcOldRatio,
    calcNewRatio
  );
  const rightTheoreticalValue = Math.max(0, theoreticalPrice - calcExercisePrice);
  const dilutionPct = calculateDilution(calcOldRatio, calcNewRatio);

  // Right Issue corporate actions list
  const rightIssueCAs = corporateActions.filter((ca) => ca.type === 'RIGHT_ISSUE');

  // Handle Exercise or Sell
  const handleExecuteHoldingAction = () => {
    if (!selectedHolding || !actionType) return;
    setActionFeedback(null);

    if (actionType === 'EXERCISE') {
      const res = onExercise(selectedHolding.code, actionLots);
      if (!res.success) {
        setActionFeedback({ type: 'error', text: res.message });
      } else {
        setActionFeedback({ type: 'success', text: res.message });
        setTimeout(() => {
          setSelectedHolding(null);
          setActionType(null);
        }, 1200);
      }
    } else {
      const res = onSellRight(selectedHolding.code, actionLots, selectedHolding.marketPrice);
      if (!res.success) {
        setActionFeedback({ type: 'error', text: res.message });
      } else {
        setActionFeedback({ type: 'success', text: res.message });
        setTimeout(() => {
          setSelectedHolding(null);
          setActionType(null);
        }, 1200);
      }
    }
  };

  const handleExecuteBuyRight = () => {
    if (!buyTargetAction) return;
    const rightCode = `${buyTargetAction.ticker}-R`;
    const parentStock = stocks.find((s) => s.ticker === buyTargetAction.ticker);
    const rightPrice = Math.max(5, (parentStock ? parentStock.price : 100) - (buyTargetAction.rightIssuePrice || 50));

    const res = onBuyRight(rightCode, buyRightsLots, rightPrice);
    if (res.success) {
      setBuyTargetAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Edukasi Mekanisme HMETD */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Pusat Hak Memesan Efek Terlebih Dahulu (HMETD)
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  Fitur Khusus BEI
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Right Issue memberi Anda hak (bukan kewajiban) untuk membeli saham baru pada harga tebus tertentu. Anda dapat <strong>menebusnya</strong> untuk mendapat saham induk, <strong>menjual haknya</strong> di pasar tunai, atau membeli sertifikat dari investor lain.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Opsi Utama Pilihan Investor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Tebus HMETD (Exercise)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bayar harga tebus untuk mengonversi sertifikat hak menjadi saham induk baru. Porsi kepemilikan Anda tidak akan terdilusi.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs mb-1">
              <ArrowRightLeft className="w-4 h-4" />
              <span>2. Jual di Pasar Tunai</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jika tidak ingin menambah modal, jual sertifikat hak ke pasar sebelum tanggal jatuh tempo (expired) untuk mengamankan kas tunai.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>3. Jangan Didiamkan!</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jika dibiarkan lewat batas jatuh tempo, sertifikat hak akan hangus bernilai Rp 0 dan kepemilikan Anda terdilusi.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Dompet HMETD Saya & Kalkulator Harga Teoritis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Dompet HMETD Pengguna (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Sertifikat HMETD Milik Anda ({rightHoldings.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                1 Lot Hak = 100 Lembar Saham Baru
              </span>
            </div>

            {rightHoldings.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-2">
                  <Coins className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Belum memiliki sertifikat HMETD aktif
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                  Pegang saham yang akan melakukan Right Issue (seperti GOTO atau BRIS) hingga Cum Date, atau beli langsung dari Pasar HMETD di bawah!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {rightHoldings.map((rh) => {
                  const parentStock = stocks.find((s) => s.ticker === rh.parentTicker);
                  const curParentPrice = parentStock ? parentStock.price : rh.exercisePrice;
                  const daysLeft = rh.expiryDay - currentDay;

                  return (
                    <div
                      key={rh.code}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0 font-mono">
                          {rh.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white font-mono">
                              {rh.code}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (Saham Induk: {rh.parentTicker})
                            </span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                              Rasio {rh.ratio}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                            <span>
                              Jumlah: <strong className="text-white">{formatNumber(rh.rightsLots)} Lot</strong>
                            </span>
                            <span>
                              Harga Tebus: <strong className="text-emerald-400">Rp {formatNumber(rh.exercisePrice)}</strong>
                            </span>
                            <span>
                              Harga Pasar Induk: <strong className="text-slate-200">Rp {formatNumber(curParentPrice)}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-amber-400 mt-1.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              Batas Akhir: Hari ke-{rh.expiryDay} ({daysLeft > 0 ? `${daysLeft} hari lagi` : 'Hari Terakhir!'})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => {
                            setSelectedHolding(rh);
                            setActionType('EXERCISE');
                            setActionLots(rh.rightsLots);
                            setActionFeedback(null);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                        >
                          Tebus HMETD
                        </button>
                        <button
                          onClick={() => {
                            setSelectedHolding(rh);
                            setActionType('SELL');
                            setActionLots(rh.rightsLots);
                            setActionFeedback(null);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg text-xs font-semibold transition-all border border-slate-700"
                        >
                          Jual di Pasar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pasar Sekunder HMETD (Beli Hak dari Pasar) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Pasar Perdagangan Hak HMETD BEI
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Peluang Arbitrase & Beli Hak
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {rightIssueCAs.map((ca) => {
                const rightCode = `${ca.ticker}-R`;
                const parentStock = stocks.find((s) => s.ticker === ca.ticker);
                const parentPrice = parentStock ? parentStock.price : 100;
                const estRightPrice = Math.max(5, parentPrice - (ca.rightIssuePrice || 50));

                return (
                  <div
                    key={ca.id}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-xs font-mono">
                          {rightCode}
                        </span>
                        <span className="text-[11px] text-slate-300">
                          {ca.title}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                        <span>
                          Harga Pasar Hak: <strong className="text-sky-400">Rp {formatNumber(estRightPrice)}</strong>
                        </span>
                        <span>
                          Harga Tebus: <strong className="text-emerald-400">Rp {formatNumber(ca.rightIssuePrice || 50)}</strong>
                        </span>
                        <span>
                          Harga Saham Induk: <strong className="text-white">Rp {formatNumber(parentPrice)}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBuyTargetAction(ca);
                        setBuyRightsLots(10);
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold self-end sm:self-center shrink-0 transition-all"
                    >
                      Beli {rightCode}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kalkulator Harga Saham Teoritis (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Kalkulator Saham Teoritis & Dilusi
              </h4>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Gunakan kalkulator ini untuk memproyeksikan harga wajar teoritis saham pasca Cum Date Right Issue dan persentase dilusi kepemilikan modal.
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Harga Saham Sebelum Cum Date (Rp)
                </label>
                <input
                  type="number"
                  value={calcCumPrice}
                  onChange={(e) => setCalcCumPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Harga Tebus / Pelaksanaan (Exercise Price) (Rp)
                </label>
                <input
                  type="number"
                  value={calcExercisePrice}
                  onChange={(e) => setCalcExercisePrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Rasio Saham Lama
                  </label>
                  <input
                    type="number"
                    value={calcOldRatio}
                    onChange={(e) => setCalcOldRatio(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Rasio Saham Baru
                  </label>
                  <input
                    type="number"
                    value={calcNewRatio}
                    onChange={(e) => setCalcNewRatio(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Hasil Kalkulasi Teoritis */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/30 mt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Harga Teoritis Saham:</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    Rp {formatNumber(theoreticalPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nilai Teoritis Hak (HMETD):</span>
                  <span className="font-mono font-bold text-sm text-sky-400">
                    Rp {formatNumber(rightTheoreticalValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Potensi Dilusi Kepemilikan:</span>
                  <span className="font-mono font-bold text-sm text-amber-400">
                    {formatPercent(dilutionPct, false)}
                  </span>
                </div>
              </div>

              {/* Rumus Penjelasan Singkat */}
              <div className="text-[10px] text-slate-500 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                P_teoritis = (P_cum × RasioLama + P_tebus × RasioBaru) / (RasioLama + RasioBaru)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Eksekusi (Tebus / Jual HMETD) */}
      {selectedHolding && actionType && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              {actionType === 'EXERCISE' ? 'Tebus HMETD Menjadi Saham' : 'Jual Sertifikat HMETD di Pasar'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Kode: <strong className="text-amber-400 font-mono">{selectedHolding.code}</strong> (Saham Induk: {selectedHolding.parentTicker})
            </p>

            <div className="flex flex-col gap-3 text-xs mb-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Jumlah Lot yang Ingin Di-{actionType === 'EXERCISE' ? 'tebus' : 'jual'} (Maks: {selectedHolding.rightsLots} Lot):
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedHolding.rightsLots}
                  value={actionLots}
                  onChange={(e) => setActionLots(Math.min(selectedHolding.rightsLots, Math.max(1, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-mono font-bold focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5 font-mono text-[11px]">
                {actionType === 'EXERCISE' ? (
                  <>
                    <div className="flex justify-between text-slate-400">
                      <span>Harga Tebus:</span>
                      <span className="text-white">Rp {formatNumber(selectedHolding.exercisePrice)}/lembar</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total Saham Baru Diterima:</span>
                      <span className="text-white">{formatNumber(actionLots * 100)} lembar</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-800">
                      <span className="text-white">Total Kas RDN Dipotong:</span>
                      <span className="text-emerald-400">
                        {formatRupiah(actionLots * 100 * selectedHolding.exercisePrice)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-slate-400">
                      <span>Harga Jual Sertifikat:</span>
                      <span className="text-white">Rp {formatNumber(selectedHolding.marketPrice)}/lembar</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-800">
                      <span className="text-white">Total Kas RDN Diterima:</span>
                      <span className="text-emerald-400">
                        {formatRupiah(actionLots * 100 * selectedHolding.marketPrice * 0.9975)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {actionFeedback && (
                <div
                  className={`p-2 rounded text-xs leading-relaxed ${
                    actionFeedback.type === 'error'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {actionFeedback.text}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  setSelectedHolding(null);
                  setActionType(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteHoldingAction}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-md transition-all ${
                  actionType === 'EXERCISE'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950'
                }`}
              >
                Konfirmasi {actionType === 'EXERCISE' ? 'Tebus Saham' : 'Jual Hak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Beli HMETD dari Pasar */}
      {buyTargetAction && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Beli Sertifikat Hak {buyTargetAction.ticker}-R
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Membeli hak HMETD dari pasar tunai memungkinkan Anda menebus saham induk baru pada harga tebus Rp {buyTargetAction.rightIssuePrice}.
            </p>

            <div className="flex flex-col gap-3 text-xs mb-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Jumlah Lot Hak yang Ingin Dibeli:
                </label>
                <input
                  type="number"
                  min="1"
                  value={buyRightsLots}
                  onChange={(e) => setBuyRightsLots(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-mono font-bold focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Harga Hak di Pasar:</span>
                  <span className="text-sky-400">
                    Rp {formatNumber(Math.max(5, (stocks.find((s) => s.ticker === buyTargetAction.ticker)?.price || 100) - (buyTargetAction.rightIssuePrice || 50)))}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-800">
                  <span className="text-white">Estimasi Total Biaya Pembelian:</span>
                  <span className="text-sky-400">
                    {formatRupiah(buyRightsLots * 100 * Math.max(5, (stocks.find((s) => s.ticker === buyTargetAction.ticker)?.price || 100) - (buyTargetAction.rightIssuePrice || 50)) * 1.0015)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setBuyTargetAction(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteBuyRight}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-md shadow-sky-950 transition-all"
              >
                Beli Sertifikat Hak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
