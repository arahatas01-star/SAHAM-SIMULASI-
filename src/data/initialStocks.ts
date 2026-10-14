import { Stock, CandleData, OrderBookEntry } from '../types/market';
import { calculateARA, calculateARB, getFractionTick, snapToTick } from '../utils/formatters';

function generateCandleHistory(basePrice: number, volatility: number = 0.02): CandleData[] {
  const candles: CandleData[] = [];
  let current = basePrice * 0.92;

  for (let i = 29; i >= 0; i--) {
    const dayLabel = i === 0 ? 'Hari Ini' : `H-${i}`;
    const changeFactor = (Math.random() - 0.48) * volatility;
    const open = snapToTick(current);
    const close = snapToTick(current * (1 + changeFactor));
    const high = snapToTick(Math.max(open, close) * (1 + Math.random() * (volatility * 0.7)));
    const low = snapToTick(Math.min(open, close) * (1 - Math.random() * (volatility * 0.7)));
    const volume = Math.floor(25000 + Math.random() * 85000);

    candles.push({
      time: dayLabel,
      open,
      high,
      low,
      close,
      volume,
    });
    current = close;
  }
  return candles;
}

function generateOrderBook(currentPrice: number): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  const tick = getFractionTick(currentPrice);

  for (let i = 1; i <= 5; i++) {
    const bidPrice = Math.max(50, currentPrice - (i - 1) * tick);
    const askPrice = currentPrice + i * tick;

    // Realistic lot volumes with thicker queues further away or at round numbers
    const bidLots = Math.floor(1200 + Math.random() * 4500 * (6 - i * 0.5));
    const askLots = Math.floor(1100 + Math.random() * 4200 * (6 - i * 0.5));

    bids.push({
      price: bidPrice,
      lots: bidLots,
      orders: Math.floor(bidLots / (20 + Math.random() * 30)),
    });

    asks.push({
      price: askPrice,
      lots: askLots,
      orders: Math.floor(askLots / (20 + Math.random() * 30)),
    });
  }

  return { bids, asks };
}

const rawStocksData = [
  {
    ticker: 'BBCA',
    name: 'Bank Central Asia Tbk.',
    sector: 'Perbankan',
    price: 10150,
    previousClose: 10025,
    marketCap: 1251.2,
    peRatio: 23.4,
    pbvRatio: 4.8,
    dividendYield: 2.8,
  },
  {
    ticker: 'BBRI',
    name: 'Bank Rakyat Indonesia (Persero) Tbk.',
    sector: 'Perbankan',
    price: 4920,
    previousClose: 4860,
    marketCap: 745.6,
    peRatio: 12.1,
    pbvRatio: 2.2,
    dividendYield: 6.5,
    hasDividendPending: true,
  },
  {
    ticker: 'BMRI',
    name: 'Bank Mandiri (Persero) Tbk.',
    sector: 'Perbankan',
    price: 6750,
    previousClose: 6700,
    marketCap: 630.0,
    peRatio: 11.5,
    pbvRatio: 2.1,
    dividendYield: 5.2,
  },
  {
    ticker: 'TLKM',
    name: 'Telkom Indonesia (Persero) Tbk.',
    sector: 'Telekomunikasi',
    price: 2980,
    previousClose: 3040,
    marketCap: 295.2,
    peRatio: 13.8,
    pbvRatio: 2.3,
    dividendYield: 5.6,
  },
  {
    ticker: 'ASII',
    name: 'Astra International Tbk.',
    sector: 'Otomotif & Konglomerasi',
    price: 5125,
    previousClose: 5050,
    marketCap: 207.5,
    peRatio: 6.8,
    pbvRatio: 1.0,
    dividendYield: 8.3,
    hasDividendPending: true,
  },
  {
    ticker: 'GOTO',
    name: 'GoTo Gojek Tokopedia Tbk.',
    sector: 'Teknologi',
    price: 68,
    previousClose: 65,
    marketCap: 81.6,
    peRatio: -14.2,
    pbvRatio: 0.9,
    dividendYield: 0.0,
    hasRightIssueActive: true,
  },
  {
    ticker: 'BREN',
    name: 'Barito Renewables Energy Tbk.',
    sector: 'Energi Terbarukan',
    price: 7350,
    previousClose: 7200,
    marketCap: 983.4,
    peRatio: 450.2,
    pbvRatio: 88.5,
    dividendYield: 0.2,
  },
  {
    ticker: 'AMMN',
    name: 'Amman Mineral Internasional Tbk.',
    sector: 'Pertambangan',
    price: 9425,
    previousClose: 9300,
    marketCap: 683.5,
    peRatio: 42.1,
    pbvRatio: 7.2,
    dividendYield: 0.0,
  },
  {
    ticker: 'ANTM',
    name: 'Aneka Tambang Tbk.',
    sector: 'Pertambangan & Logam',
    price: 1560,
    previousClose: 1530,
    marketCap: 37.5,
    peRatio: 14.8,
    pbvRatio: 1.5,
    dividendYield: 3.8,
  },
  {
    ticker: 'ICBP',
    name: 'Indofood CBP Sukses Makmur Tbk.',
    sector: 'Barang Konsumen Primer',
    price: 11450,
    previousClose: 11500,
    marketCap: 133.5,
    peRatio: 15.2,
    pbvRatio: 2.8,
    dividendYield: 3.2,
  },
  {
    ticker: 'BRIS',
    name: 'Bank Syariah Indonesia Tbk.',
    sector: 'Perbankan Syariah',
    price: 2940,
    previousClose: 2880,
    marketCap: 135.6,
    peRatio: 22.4,
    pbvRatio: 3.4,
    dividendYield: 1.1,
    hasRightIssueActive: true,
  },
  {
    ticker: 'PGAS',
    name: 'Perusahaan Gas Negara Tbk.',
    sector: 'Minyak & Gas Bumi',
    price: 1535,
    previousClose: 1510,
    marketCap: 37.2,
    peRatio: 8.4,
    pbvRatio: 0.8,
    dividendYield: 9.7,
  },
];

export const initialStocks: Stock[] = rawStocksData.map((s) => {
  const history = generateCandleHistory(s.price);
  const latestClose = history[history.length - 1].close;
  const change = latestClose - s.previousClose;
  const changePercent = (change / s.previousClose) * 100;
  const ara = calculateARA(s.previousClose);
  const arb = calculateARB(s.previousClose);
  const openPrice = snapToTick(s.previousClose * (1 + (Math.random() - 0.5) * 0.01));
  const high = Math.max(openPrice, latestClose, snapToTick(latestClose * 1.015));
  const low = Math.min(openPrice, latestClose, snapToTick(latestClose * 0.985));
  const volume = Math.floor(45000 + Math.random() * 120000);
  const turnover = volume * 100 * latestClose;

  return {
    ...s,
    price: latestClose,
    openPrice,
    high,
    low,
    change,
    changePercent,
    volume,
    turnover,
    araPrice: ara,
    arbPrice: arb,
    history,
    orderBook: generateOrderBook(latestClose),
  };
});
