import React, { useState, useMemo } from 'react';
import { Stock, CandleData } from '../types/market';
import { formatNumber, formatLot } from '../utils/formatters';
import { BarChart3, TrendingUp, Maximize2 } from 'lucide-react';

interface StockChartProps {
  stock: Stock;
}

export const StockChart: React.FC<StockChartProps> = ({ stock }) => {
  const [chartType, setChartType] = useState<'CANDLE' | 'AREA'>('CANDLE');
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  const candles = stock.history;

  // Chart dimensions
  const width = 640;
  const height = 300;
  const padding = { top: 20, right: 60, bottom: 45, left: 10 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const volumeHeight = 50;
  const pricePlotHeight = plotHeight - volumeHeight - 15;

  // Price Bounds
  const { minPrice, maxPrice, minVol, maxVol, ma5Points } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 0, maxPrice: 100, minVol: 0, maxVol: 1000, ma5Points: [] };
    }

    let minP = Infinity;
    let maxP = -Infinity;
    let maxV = 0;

    candles.forEach((c) => {
      if (c.low < minP) minP = c.low;
      if (c.high > maxP) maxP = c.high;
      if (c.volume > maxV) maxV = c.volume;
    });

    // Add 2% margin to bounds
    const margin = (maxP - minP) * 0.08 || 10;
    minP = Math.max(0, minP - margin);
    maxP = maxP + margin;

    // Calculate MA5
    const ma5: { x: number; y: number }[] = [];
    const candleWidth = plotWidth / candles.length;

    for (let i = 0; i < candles.length; i++) {
      if (i >= 4) {
        const slice = candles.slice(i - 4, i + 1);
        const avg = slice.reduce((sum, item) => sum + item.close, 0) / 5;
        const x = padding.left + i * candleWidth + candleWidth / 2;
        const y = padding.top + pricePlotHeight - ((avg - minP) / (maxP - minP)) * pricePlotHeight;
        ma5.push({ x, y });
      }
    }

    return {
      minPrice: minP,
      maxPrice: maxP,
      minVol: 0,
      maxVol: maxV * 1.15,
      ma5Points: ma5,
    };
  }, [candles, plotWidth, pricePlotHeight, padding.left, padding.top]);

  const candleWidth = plotWidth / Math.max(1, candles.length);
  const barWidth = Math.max(2, candleWidth * 0.65);

  const getY = (val: number) => {
    return padding.top + pricePlotHeight - ((val - minPrice) / (maxPrice - minPrice)) * pricePlotHeight;
  };

  const getVolY = (vol: number) => {
    const bottomY = padding.top + plotHeight;
    const h = (vol / (maxVol || 1)) * volumeHeight;
    return { y: bottomY - h, h };
  };

  // Area Path generator
  const areaPath = useMemo(() => {
    if (candles.length === 0) return '';
    let d = `M ${padding.left + candleWidth / 2} ${getY(candles[0].close)}`;
    for (let i = 1; i < candles.length; i++) {
      const x = padding.left + i * candleWidth + candleWidth / 2;
      const y = getY(candles[i].close);
      d += ` L ${x} ${y}`;
    }
    const lastX = padding.left + (candles.length - 1) * candleWidth + candleWidth / 2;
    const bottomY = padding.top + pricePlotHeight;
    const closed = `${d} L ${lastX} ${bottomY} L ${padding.left + candleWidth / 2} ${bottomY} Z`;
    return { line: d, fill: closed };
  }, [candles, candleWidth, padding.left, padding.top, pricePlotHeight, minPrice, maxPrice]);

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
      {/* Chart Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">{stock.ticker}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">{stock.name}</span>
          </div>

          {activeCandle && (
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-slate-400">O: <strong className="text-slate-200">{formatNumber(activeCandle.open)}</strong></span>
              <span className="text-slate-400">H: <strong className="text-emerald-400">{formatNumber(activeCandle.high)}</strong></span>
              <span className="text-slate-400">L: <strong className="text-rose-400">{formatNumber(activeCandle.low)}</strong></span>
              <span className="text-slate-400">C: <strong className="text-white">{formatNumber(activeCandle.close)}</strong></span>
              <span className="text-slate-400 hidden md:inline">Vol: <strong className="text-slate-300">{formatNumber(activeCandle.volume)}</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setChartType('CANDLE')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                chartType === 'CANDLE'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Candle
            </button>
            <button
              onClick={() => setChartType('AREA')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                chartType === 'AREA'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Line Area
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
            <span className="w-2 h-0.5 bg-amber-400 rounded-full" />
            <span>MA5</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[340px]"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + pricePlotHeight * pct;
            const priceVal = maxPrice - (maxPrice - minPrice) * pct;
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={width - padding.right + 6}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                >
                  {formatNumber(priceVal)}
                </text>
              </g>
            );
          })}

          {/* Volume separator */}
          <line
            x1={padding.left}
            y1={padding.top + pricePlotHeight + 8}
            x2={width - padding.right}
            y2={padding.top + pricePlotHeight + 8}
            stroke="#334155"
            strokeWidth="0.8"
          />

          {/* Volume Bars */}
          {candles.map((c, i) => {
            const x = padding.left + i * candleWidth + (candleWidth - barWidth) / 2;
            const { y, h } = getVolY(c.volume);
            const isGreen = c.close >= c.open;
            return (
              <rect
                key={`vol-${i}`}
                x={x}
                y={y}
                width={barWidth}
                height={h}
                fill={isGreen ? '#10b981' : '#ef4444'}
                opacity={0.4}
              />
            );
          })}

          {/* AREA CHART MODE */}
          {chartType === 'AREA' && typeof areaPath !== 'string' && (
            <>
              <path d={areaPath.fill} fill="url(#areaGradient)" />
              <path
                d={areaPath.line}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}

          {/* CANDLESTICK CHART MODE */}
          {chartType === 'CANDLE' &&
            candles.map((c, i) => {
              const centerX = padding.left + i * candleWidth + candleWidth / 2;
              const rectX = centerX - barWidth / 2;
              const isGreen = c.close >= c.open;
              const color = isGreen ? '#10b981' : '#f43f5e';

              const wickTop = getY(c.high);
              const wickBottom = getY(c.low);
              const bodyTop = getY(Math.max(c.open, c.close));
              const bodyBottom = getY(Math.min(c.open, c.close));
              const bodyHeight = Math.max(1.5, bodyBottom - bodyTop);

              return (
                <g
                  key={`candle-${i}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredCandle(c)}
                >
                  {/* Wick */}
                  <line
                    x1={centerX}
                    y1={wickTop}
                    x2={centerX}
                    y2={wickBottom}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Body */}
                  <rect
                    x={rectX}
                    y={bodyTop}
                    width={barWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })}

          {/* MA5 Trendline */}
          {ma5Points.length > 1 && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.4"
              strokeLinecap="round"
              points={ma5Points.map((p) => `${p.x},${p.y}`).join(' ')}
            />
          )}

          {/* Interactive hover crosshair vertical */}
          {hoveredCandle && (
            (() => {
              const idx = candles.indexOf(hoveredCandle);
              if (idx === -1) return null;
              const x = padding.left + idx * candleWidth + candleWidth / 2;
              return (
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + plotHeight}
                  stroke="#94a3b8"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />
              );
            })()
          )}
        </svg>
      </div>

      {/* Footer Info: ARA / ARB / Fraksi Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-1 border-t border-slate-800 text-[11px]">
        <div className="bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60">
          <span className="text-slate-400">Batas ARA (+25%):</span>
          <p className="font-mono font-bold text-emerald-400">
            Rp {formatNumber(stock.araPrice)}
          </p>
        </div>
        <div className="bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60">
          <span className="text-slate-400">Batas ARB (-25%):</span>
          <p className="font-mono font-bold text-rose-400">
            Rp {formatNumber(stock.arbPrice)}
          </p>
        </div>
        <div className="bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60">
          <span className="text-slate-400">Harga Penutupan Kemarin:</span>
          <p className="font-mono font-bold text-slate-200">
            Rp {formatNumber(stock.previousClose)}
          </p>
        </div>
        <div className="bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60">
          <span className="text-slate-400">P/E & P/BV Ratio:</span>
          <p className="font-mono font-bold text-sky-400">
            {stock.peRatio}x · {stock.pbvRatio}x
          </p>
        </div>
      </div>
    </div>
  );
};
