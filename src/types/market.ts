export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  lots: number;
  orders: number;
}

export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  previousClose: number;
  openPrice: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  volume: number; // in lots
  turnover: number; // in Rupiah
  araPrice: number; // Auto Rejection Atas
  arbPrice: number; // Auto Rejection Bawah
  history: CandleData[];
  orderBook: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  };
  marketCap: number; // in Triliun Rupiah
  peRatio: number;
  pbvRatio: number;
  dividendYield: number; // in percent
  hasRightIssueActive?: boolean;
  hasDividendPending?: boolean;
}

export interface PortfolioHolding {
  ticker: string;
  lots: number;
  avgBuyPrice: number;
  totalCost: number;
}

export interface RightIssueHolding {
  code: string; // e.g., 'GOTO-R'
  parentTicker: string;
  rightsLots: number;
  exercisePrice: number;
  marketPrice: number;
  expiryDay: number;
  ratio: string; // e.g., "100 : 25"
}

export type CorporateActionType = 'DIVIDEND' | 'STOCK_SPLIT' | 'RIGHT_ISSUE' | 'BONUS_SHARES';

export interface CorporateAction {
  id: string;
  ticker: string;
  type: CorporateActionType;
  title: string;
  description: string;
  cumDate: number; // day index
  exDate: number;
  paymentDate: number;
  dividendAmount?: number; // Rp per share
  splitRatio?: { old: number; new: number }; // e.g. 1 : 5
  rightIssuePrice?: number;
  rightRatio?: { old: number; new: number }; // e.g. 100 : 25
  bonusRatio?: { old: number; new: number };
  executedCum: boolean;
  executedEx: boolean;
  executedPayment: boolean;
}

export type NewsSentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface MarketNews {
  id: string;
  title: string;
  snippet: string;
  source: 'Bisnis.com' | 'CNBC Indonesia' | 'Kontan' | 'Investor Daily' | 'Keterbukaan IDX';
  day: number;
  time: string;
  relatedTicker?: string;
  sentiment: NewsSentiment;
  impactPercent: number;
  read: boolean;
}

export type TransactionType =
  | 'BUY'
  | 'SELL'
  | 'RIGHT_BUY'
  | 'RIGHT_SELL'
  | 'EXERCISE_RIGHT'
  | 'DIVIDEND_PAYOUT'
  | 'STOCK_SPLIT_ADJUST';

export interface TradeTransaction {
  id: string;
  day: number;
  time: string;
  ticker: string;
  type: TransactionType;
  price: number;
  lots: number;
  grossAmount: number;
  fee: number;
  netAmount: number;
  profitLoss?: number;
  profitLossPercent?: number;
  note?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardCash: number;
  xp: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  category: 'TRADING' | 'RIGHT_ISSUE' | 'CORPORATE_ACTION' | 'PROFIT';
}

export interface TraderRank {
  title: string;
  level: number;
  minNetWorth: number;
  badgeColor: string;
  iconName: string;
}
