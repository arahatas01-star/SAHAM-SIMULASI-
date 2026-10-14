import React, { useState } from 'react';
import {
  PortfolioHolding,
  RightIssueHolding,
  Stock,
  TradeTransaction,
} from '../types/market';
import {
  formatRupiah,
  formatNumber,
  formatPercent,
} from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  History,
  ShoppingCart,
  Tag,
  Coins,
  ArrowRight,
} from 'lucide-react';

interface PortfolioViewProps {
  portfolio: PortfolioHolding[];
  rightHoldings: RightIssueHolding[];
  stocks: Stock[];
  cashBalance: number;
  stockValue: number;
  totalEquity: number;
  floatingProfit: number;
  floatingProfitPercent: number;
  transactions: TradeTransaction[];
  onSelectStock: (ticker: string) => void;
  onNavigateToRights: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolio,
  rightHoldings,
  stocks,
  cashBalance,
  stockValue,
  totalEquity,
  floatingProfit,
  floatingProfitPercent,
  transactions,
  onSelectStock,
  onNavigateToRights,
}) => {
  const [historyFilter, setHistoryFilter] = useState<string>('ALL');

  const filteredTransactions = transactions.filter((tx) => {
    if (historyFilter === 'ALL') return true;
    if (historyFilter === 'BUY_SELL') return tx.type === 'BUY' || tx.type === 'SELL';
    if (historyFilter === 'DIVIDEND') return tx.type === 'DIVIDEND_PAYOUT';
    if (historyFilter === 'RIGHTS')
      return (
        tx.type === 'RIGHT_BUY' ||
        tx.type === 'RIGHT_SELL' ||
        tx.type === 'EXERCISE_RIGHT'
      );
    return true;
  });

  const isProfit = floatingProfit >= 0;

  return (
    <div className="flex flex-col gap-6">
      {/* HUD Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] text-slate-400 block mb-1">
            Saldo Kas RDN (Tersedia)
          </span>
          <p className="font-mono text-base font-bold text-white">
            {formatRupiah(cashBalance)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] text-slate-400 block mb-1">
            Nilai Saham Portofolio
          </span>
          <p className="font-mono text-base font-bold text-white">
            {formatRupiah(stockValue)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] text-slate-400 block mb-1">
            Total Ekuitas Akun
          </span>
          <p className="font-mono text-base font-bold text-emerald-400">
            {formatRupiah(totalEquity)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] text-slate-400 block mb-1">
            Floating Profit / Loss
          </span>
          <p
            className={`font-mono text-base font-bold flex items-center gap-1 ${
              isProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {formatRupiah(floatingProfit)} ({formatPercent(floatingProfitPercent)})
          </p>
        </div>
      </div>

      {/* Tabel Kepemilikan Saham Aktif */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Saham yang Dimiliki ({portfolio.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Satuan: 1 Lot = 100 Lembar
          </span>
        </div>

        {portfolio.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-2">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300 font-semibold">
              Portofolio saham Anda masih kosong
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mt-1">
              Gunakan Saldo Kas RDN Rp 20 Juta Anda untuk membeli saham pilihan pertama di tab Trading Desk!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-2">Emiten</th>
                  <th className="pb-2 text-right">Jumlah Lot</th>
                  <th className="pb-2 text-right">Avg Beli</th>
                  <th className="pb-2 text-right">Harga Terkini</th>
                  <th className="pb-2 text-right">Nilai Pasar</th>
                  <th className="pb-2 text-right">Floating P/L</th>
                  <th className="pb-2 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {portfolio.map((item) => {
                  const stock = stocks.find((s) => s.ticker === item.ticker);
                  const curPrice = stock ? stock.price : item.avgBuyPrice;
                  const curValue = item.lots * 100 * curPrice;
                  const pnl = curValue - item.totalCost;
                  const pnlPercent = item.totalCost > 0 ? (pnl / item.totalCost) * 100 : 0;
                  const itemProfit = pnl >= 0;

                  return (
                    <tr
                      key={item.ticker}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-xs">
                            {item.ticker}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px] hidden sm:inline">
                            {stock?.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-slate-200">
                        {formatNumber(item.lots)} Lot
                      </td>
                      <td className="py-3 text-right text-slate-400">
                        Rp {formatNumber(item.avgBuyPrice)}
                      </td>
                      <td className="py-3 text-right font-bold text-white">
                        Rp {formatNumber(curPrice)}
                      </td>
                      <td className="py-3 text-right text-slate-200 font-semibold">
                        {formatRupiah(curValue)}
                      </td>
                      <td
                        className={`py-3 text-right font-bold ${
                          itemProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatRupiah(pnl)} ({formatPercent(pnlPercent)})
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => onSelectStock(item.ticker)}
                          className="px-2.5 py-1 text-[11px] font-sans font-semibold text-emerald-400 hover:text-white bg-slate-800 hover:bg-emerald-600 rounded transition-colors"
                        >
                          Trade {item.ticker}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right Issue Mini Card (if holding any HMETD) */}
      {rightHoldings.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                Anda Memiliki {rightHoldings.length} Sertifikat Right Issue (HMETD) Aktif!
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Jangan biarkan hak Anda hangus. Buka Pusat Right Issue untuk menebusnya menjadi saham atau menjualnya di pasar tunai.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToRights}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shrink-0 self-end sm:self-center transition-all shadow-md shadow-amber-950"
          >
            <span>Buka Pusat HMETD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Buku Riwayat Transaksi */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Buku Catatan Transaksi ({transactions.length})
            </h3>
          </div>

          {/* Filter Riwayat */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setHistoryFilter('ALL')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                historyFilter === 'ALL'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setHistoryFilter('BUY_SELL')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                historyFilter === 'BUY_SELL'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Jual/Beli
            </button>
            <button
              onClick={() => setHistoryFilter('DIVIDEND')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                historyFilter === 'DIVIDEND'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dividen
            </button>
            <button
              onClick={() => setHistoryFilter('RIGHTS')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                historyFilter === 'RIGHTS'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Right Issue
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            Belum ada catatan transaksi pada filter ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-2">Hari & Jam</th>
                  <th className="pb-2">Aksi</th>
                  <th className="pb-2">Kode</th>
                  <th className="pb-2 text-right">Harga</th>
                  <th className="pb-2 text-right">Lot</th>
                  <th className="pb-2 text-right">Total Net</th>
                  <th className="pb-2 text-right">Realisasi Cuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono text-[11px]">
                {filteredTransactions.map((tx) => {
                  const isBuy = tx.type === 'BUY' || tx.type === 'RIGHT_BUY';
                  const isSell = tx.type === 'SELL' || tx.type === 'RIGHT_SELL';
                  const isDiv = tx.type === 'DIVIDEND_PAYOUT';
                  const isEx = tx.type === 'EXERCISE_RIGHT';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 text-slate-400">
                        H-{tx.day} · {tx.time}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                            isBuy
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : isSell
                              ? 'bg-rose-500/15 text-rose-400'
                              : isDiv
                              ? 'bg-sky-500/15 text-sky-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-white">{tx.ticker}</td>
                      <td className="py-2.5 text-right text-slate-300">
                        Rp {formatNumber(tx.price)}
                      </td>
                      <td className="py-2.5 text-right text-slate-300">
                        {formatNumber(tx.lots)}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-100">
                        {formatRupiah(tx.netAmount)}
                      </td>
                      <td
                        className={`py-2.5 text-right font-bold ${
                          tx.profitLoss !== undefined
                            ? tx.profitLoss >= 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {tx.profitLoss !== undefined ? formatRupiah(tx.profitLoss) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
