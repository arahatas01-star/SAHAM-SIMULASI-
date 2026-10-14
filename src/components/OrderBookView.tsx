import React, { useMemo } from 'react';
import { Stock } from '../types/market';
import { formatNumber } from '../utils/formatters';

interface OrderBookViewProps {
  stock: Stock;
  onSelectPrice: (price: number) => void;
}

export const OrderBookView: React.FC<OrderBookViewProps> = ({
  stock,
  onSelectPrice,
}) => {
  const { bids, asks } = stock.orderBook;

  const { totalBidLots, totalAskLots, maxLotInRow } = useMemo(() => {
    let bTotal = 0;
    let aTotal = 0;
    let maxLot = 1;

    bids.forEach((b) => {
      bTotal += b.lots;
      if (b.lots > maxLot) maxLot = b.lots;
    });

    asks.forEach((a) => {
      aTotal += a.lots;
      if (a.lots > maxLot) maxLot = a.lots;
    });

    return { totalBidLots: bTotal, totalAskLots: aTotal, maxLotInRow: maxLot };
  }, [bids, asks]);

  const bidRatio =
    totalBidLots + totalAskLots > 0
      ? (totalBidLots / (totalBidLots + totalAskLots)) * 100
      : 50;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Order Book (5-Depth)
            </span>
            <span className="text-[10px] text-slate-400">· 1 Lot = 100 Lbr</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Klik harga untuk order
          </span>
        </div>

        {/* Table Column Headers */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-400 pb-1 mb-1 border-b border-slate-800/60">
          <div className="grid grid-cols-3 text-left">
            <span>Antre</span>
            <span className="text-right">Lot Beli</span>
            <span className="text-right font-mono text-emerald-400">BID</span>
          </div>
          <div className="grid grid-cols-3 text-left">
            <span className="font-mono text-rose-400">OFFER</span>
            <span className="text-right">Lot Jual</span>
            <span className="text-right">Antre</span>
          </div>
        </div>

        {/* Rows (5 Depths) */}
        <div className="flex flex-col gap-1 text-xs font-mono">
          {Array.from({ length: 5 }).map((_, idx) => {
            const bid = bids[idx];
            const ask = asks[idx];

            const bidWidthPct = bid ? (bid.lots / maxLotInRow) * 100 : 0;
            const askWidthPct = ask ? (ask.lots / maxLotInRow) * 100 : 0;

            return (
              <div
                key={idx}
                className="grid grid-cols-2 gap-2 py-0.5 relative items-center"
              >
                {/* BID Side */}
                {bid ? (
                  <button
                    onClick={() => onSelectPrice(bid.price)}
                    className="grid grid-cols-3 items-center relative text-left py-1 px-1 rounded hover:bg-emerald-950/40 transition-colors group cursor-pointer overflow-hidden"
                  >
                    {/* Background depth bar */}
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 group-hover:bg-emerald-500/25 transition-all"
                      style={{ width: `${bidWidthPct}%` }}
                    />
                    <span className="text-[10px] text-slate-400 z-10">
                      {formatNumber(bid.orders)}
                    </span>
                    <span className="text-right text-slate-200 font-semibold z-10 text-[11px]">
                      {formatNumber(bid.lots)}
                    </span>
                    <span className="text-right font-bold text-emerald-400 z-10">
                      {formatNumber(bid.price)}
                    </span>
                  </button>
                ) : (
                  <div />
                )}

                {/* OFFER Side */}
                {ask ? (
                  <button
                    onClick={() => onSelectPrice(ask.price)}
                    className="grid grid-cols-3 items-center relative text-left py-1 px-1 rounded hover:bg-rose-950/40 transition-colors group cursor-pointer overflow-hidden"
                  >
                    {/* Background depth bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-rose-500/15 group-hover:bg-rose-500/25 transition-all"
                      style={{ width: `${askWidthPct}%` }}
                    />
                    <span className="font-bold text-rose-400 z-10">
                      {formatNumber(ask.price)}
                    </span>
                    <span className="text-right text-slate-200 font-semibold z-10 text-[11px]">
                      {formatNumber(ask.lots)}
                    </span>
                    <span className="text-right text-[10px] text-slate-400 z-10">
                      {formatNumber(ask.orders)}
                    </span>
                  </button>
                ) : (
                  <div />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer: Total Bid vs Offer Ratio Bar */}
      <div className="pt-3 mt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
          <span className="text-emerald-400 font-bold">
            Total Bid: {formatNumber(totalBidLots)}
          </span>
          <span className="text-slate-400 text-[10px]">
            {bidRatio > 55 ? 'Dominasi Beli' : bidRatio < 45 ? 'Dominasi Jual' : 'Seimbang'}
          </span>
          <span className="text-rose-400 font-bold">
            Total Offer: {formatNumber(totalAskLots)}
          </span>
        </div>

        {/* Visual Ratio Bar */}
        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${bidRatio}%` }}
          />
          <div
            className="bg-rose-500 transition-all duration-300"
            style={{ width: `${100 - bidRatio}%` }}
          />
        </div>
      </div>
    </div>
  );
};
