import React, { useState, useEffect } from 'react';
import { Stock, PortfolioHolding } from '../types/market';
import { StockChart } from './StockChart';
import { OrderBookView } from './OrderBookView';
import {
  formatRupiah,
  formatNumber,
  formatPercent,
  getFractionTick,
  snapToTick,
  calculateBrokerFee,
} from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, Info, AlertCircle, ShoppingCart, Tag } from 'lucide-react';

interface StockTradingDeskProps {
  stock: Stock;
  cashBalance: number;
  userHolding?: PortfolioHolding;
  onBuy: (ticker: string, lots: number, price?: number) => { success: boolean; message: string };
  onSell: (ticker: string, lots: number, price?: number) => { success: boolean; message: string };
}

export const StockTradingDesk: React.FC<StockTradingDeskProps> = ({
  stock,
  cashBalance,
  userHolding,
  onBuy,
  onSell,
}) => {
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [inputPrice, setInputPrice] = useState<number>(stock.price);
  const [inputLots, setInputLots] = useState<number>(1);
  const [formFeedback, setFormFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Sync price when stock changes
  useEffect(() => {
    setInputPrice(stock.price);
    setFormFeedback(null);
  }, [stock.ticker, stock.price]);

  const tickSize = getFractionTick(inputPrice);

  // Calculate maximum lots possible to buy
  const maxBuyLots = Math.max(
    0,
    Math.floor(cashBalance / ((inputPrice * 100) * 1.0015))
  );

  const maxSellLots = userHolding ? userHolding.lots : 0;

  // Handle Tick increment/decrement
  const handlePriceStep = (dir: 1 | -1) => {
    const nextVal = inputPrice + dir * tickSize;
    if (nextVal > stock.araPrice || nextVal < stock.arbPrice) return;
    setInputPrice(snapToTick(nextVal));
  };

  // Transaction calculations
  const execPrice = orderType === 'MARKET' ? stock.price : inputPrice;
  const grossAmount = inputLots * 100 * execPrice;
  const fee = calculateBrokerFee(grossAmount, orderSide === 'BUY');
  const totalAmount = orderSide === 'BUY' ? grossAmount + fee : grossAmount - fee;

  // Potential PnL on sell
  const potentialPnL =
    orderSide === 'SELL' && userHolding
      ? (execPrice - userHolding.avgBuyPrice) * inputLots * 100 - fee
      : 0;

  // Form submission
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (inputLots <= 0) {
      setFormFeedback({ type: 'error', text: 'Jumlah lot harus minimal 1 Lot!' });
      return;
    }

    if (orderSide === 'BUY') {
      const res = onBuy(stock.ticker, inputLots, orderType === 'MARKET' ? undefined : inputPrice);
      if (!res.success) {
        setFormFeedback({ type: 'error', text: res.message });
      } else {
        setFormFeedback({ type: 'success', text: res.message });
        setInputLots(1);
      }
    } else {
      const res = onSell(stock.ticker, inputLots, orderType === 'MARKET' ? undefined : inputPrice);
      if (!res.success) {
        setFormFeedback({ type: 'error', text: res.message });
      } else {
        setFormFeedback({ type: 'success', text: res.message });
        setInputLots(1);
      }
    }
  };

  // Quick Lot setter
  const setQuickLots = (multiplier: number, isPercent = false) => {
    if (isPercent) {
      const base = orderSide === 'BUY' ? maxBuyLots : maxSellLots;
      const calculated = Math.max(1, Math.floor(base * multiplier));
      setInputLots(calculated);
    } else {
      setInputLots((prev) => Math.max(1, prev + multiplier));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Chart Section (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <StockChart stock={stock} />
      </div>

      {/* Order Book Section (2.5 cols) */}
      <div className="lg:col-span-5 xl:col-span-2 flex flex-col">
        <OrderBookView
          stock={stock}
          onSelectPrice={(p) => {
            setInputPrice(p);
            setOrderType('LIMIT');
          }}
        />
      </div>

      {/* Trading Execution Desk (2.5 / 3 cols) */}
      <div className="lg:col-span-12 xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <form onSubmit={handleSubmitOrder} className="flex flex-col gap-3">
          {/* Buy / Sell Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setOrderSide('BUY');
                setFormFeedback(null);
              }}
              className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                orderSide === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>BELI (BUY)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderSide('SELL');
                setFormFeedback(null);
              }}
              className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                orderSide === 'SELL'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>JUAL (SELL)</span>
            </button>
          </div>

          {/* Limit / Market Order Type */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Tipe Order:</span>
            <div className="flex items-center bg-slate-950 p-0.5 rounded-md border border-slate-800">
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  orderType === 'LIMIT'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Limit
              </button>
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  orderType === 'MARKET'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Market (Haka/Haki)
              </button>
            </div>
          </div>

          {/* Price Input with Tick Steps */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Harga (Rp)</span>
              <span className="text-[10px] text-slate-400">
                Fraksi: Rp {tickSize}
              </span>
            </div>

            {orderType === 'LIMIT' ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePriceStep(-1)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
                >
                  -{tickSize}
                </button>
                <input
                  type="number"
                  value={inputPrice}
                  onChange={(e) => setInputPrice(Number(e.target.value))}
                  onBlur={() => setInputPrice(snapToTick(inputPrice))}
                  min={stock.arbPrice}
                  max={stock.araPrice}
                  step={tickSize}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handlePriceStep(1)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
                >
                  +{tickSize}
                </button>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-center font-mono font-bold text-emerald-400 text-sm">
                Harga Pasar (Rp {formatNumber(stock.price)})
              </div>
            )}
          </div>

          {/* Lots Input */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Jumlah Lot</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {orderSide === 'BUY'
                  ? `Maks: ${formatNumber(maxBuyLots)} Lot`
                  : `Dimiliki: ${formatNumber(maxSellLots)} Lot`}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setInputLots((prev) => Math.max(1, prev - 1))}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
              >
                -1
              </button>
              <input
                type="number"
                value={inputLots}
                onChange={(e) => setInputLots(Math.max(1, Number(e.target.value)))}
                min="1"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setInputLots((prev) => prev + 1)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
              >
                +1
              </button>
            </div>

            {/* Quick Lot Buttons */}
            <div className="grid grid-cols-4 gap-1 mt-1.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setQuickLots(5)}
                className="py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded text-center transition-colors"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => setQuickLots(10)}
                className="py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded text-center transition-colors"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => setQuickLots(0.5, true)}
                className="py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded text-center transition-colors"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setQuickLots(1.0, true)}
                className="py-1 bg-slate-800/80 hover:bg-slate-700 text-emerald-400 font-bold rounded text-center transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Nilai Kotor:</span>
              <span className="font-mono text-slate-200">
                {formatRupiah(grossAmount)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Fee Broker {orderSide === 'BUY' ? '(0.15%)' : '(0.25%)'}:</span>
              <span className="font-mono text-slate-400">
                {formatRupiah(fee)}
              </span>
            </div>
            <div className="h-px bg-slate-800 my-0.5" />
            <div className="flex justify-between font-bold text-xs">
              <span className="text-white">
                {orderSide === 'BUY' ? 'Total Bayar:' : 'Total Diterima:'}
              </span>
              <span
                className={`font-mono ${
                  orderSide === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatRupiah(totalAmount)}
              </span>
            </div>

            {orderSide === 'SELL' && userHolding && (
              <div className="mt-1 pt-1 border-t border-slate-800/80 flex justify-between text-[10px]">
                <span className="text-slate-400">Estimasi Realisasi Cuan:</span>
                <span
                  className={`font-mono font-bold ${
                    potentialPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatRupiah(potentialPnL)}
                </span>
              </div>
            )}
          </div>

          {/* Feedback message */}
          {formFeedback && (
            <div
              className={`p-2 rounded text-xs leading-relaxed ${
                formFeedback.type === 'error'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {formFeedback.text}
            </div>
          )}

          {/* Main Action Submit Button */}
          <button
            type="submit"
            className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all active:scale-98 ${
              orderSide === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950'
            }`}
          >
            {orderSide === 'BUY'
              ? `Beli ${inputLots} Lot ${stock.ticker}`
              : `Jual ${inputLots} Lot ${stock.ticker}`}
          </button>
        </form>

        {/* User Current Holding Info in this Stock */}
        {userHolding && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-300">
            <span className="text-slate-400 block mb-0.5">Posisi Anda di {stock.ticker}:</span>
            <div className="flex items-center justify-between font-mono">
              <span>{userHolding.lots} Lot ({formatNumber(userHolding.lots * 100)} lbr)</span>
              <span>Avg: Rp {formatNumber(userHolding.avgBuyPrice)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
