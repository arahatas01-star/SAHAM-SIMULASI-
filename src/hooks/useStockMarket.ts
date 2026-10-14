import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Stock,
  PortfolioHolding,
  RightIssueHolding,
  CorporateAction,
  MarketNews,
  TradeTransaction,
  Quest,
} from '../types/market';
import { initialStocks } from '../data/initialStocks';
import { initialCorporateActions } from '../data/initialCorporateActions';
import { initialNews } from '../data/initialNews';
import { initialQuests } from '../data/initialQuests';
import {
  calculateBrokerFee,
  getFractionTick,
  snapToTick,
  soundFx,
} from '../utils/formatters';

export interface MarketNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

const STORAGE_KEY = 'idx_cuan_sim_v1';
const INITIAL_CASH = 20_000_000; // Rp 20 Juta modal awal

export function useStockMarket() {
  // Load state from localStorage or initial defaults
  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cash`);
      return saved ? JSON.parse(saved) : INITIAL_CASH;
    } catch {
      return INITIAL_CASH;
    }
  });

  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_portfolio`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [rightHoldings, setRightHoldings] = useState<RightIssueHolding[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_rights`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stocks, setStocks] = useState<Stock[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_stocks`);
      return saved ? JSON.parse(saved) : initialStocks;
    } catch {
      return initialStocks;
    }
  });

  const [corporateActions, setCorporateActions] = useState<CorporateAction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_corporateActions`);
      return saved ? JSON.parse(saved) : initialCorporateActions;
    } catch {
      return initialCorporateActions;
    }
  });

  const [news, setNews] = useState<MarketNews[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_news`);
      return saved ? JSON.parse(saved) : initialNews;
    } catch {
      return initialNews;
    }
  });

  const [transactions, setTransactions] = useState<TradeTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_quests`);
      return saved ? JSON.parse(saved) : initialQuests;
    } catch {
      return initialQuests;
    }
  });

  const [currentDay, setCurrentDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_day`);
      return saved ? JSON.parse(saved) : 1;
    } catch {
      return 1;
    }
  });

  const [selectedTicker, setSelectedTicker] = useState<string>('BBRI');
  const [simSpeed, setSimSpeed] = useState<'pause' | '1x' | '2x' | '5x'>('1x');
  const [notifications, setNotifications] = useState<MarketNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Time sessions in a day (09:00 - 16:00)
  const [sessionTime, setSessionTime] = useState<string>('09:30 WIB (Sesi 1)');

  const notify = useCallback((type: 'success' | 'warning' | 'info' | 'error', title: string, message: string) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setNotifications((prev) => [
      { id, type, title, message, timestamp: Date.now() },
      ...prev.slice(0, 7),
    ]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_cash`, JSON.stringify(cashBalance));
      localStorage.setItem(`${STORAGE_KEY}_portfolio`, JSON.stringify(portfolio));
      localStorage.setItem(`${STORAGE_KEY}_rights`, JSON.stringify(rightHoldings));
      localStorage.setItem(`${STORAGE_KEY}_stocks`, JSON.stringify(stocks));
      localStorage.setItem(`${STORAGE_KEY}_corporateActions`, JSON.stringify(corporateActions));
      localStorage.setItem(`${STORAGE_KEY}_news`, JSON.stringify(news));
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_quests`, JSON.stringify(quests));
      localStorage.setItem(`${STORAGE_KEY}_day`, JSON.stringify(currentDay));
    } catch {
      // Ignore quota error
    }
  }, [cashBalance, portfolio, rightHoldings, stocks, corporateActions, news, transactions, quests, currentDay]);

  // Sync sound setting
  useEffect(() => {
    soundFx.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Selected Stock object
  const activeStock = useMemo(() => {
    return stocks.find((s) => s.ticker === selectedTicker) || stocks[0];
  }, [stocks, selectedTicker]);

  // Calculate portfolio valuation
  const portfolioValuation = useMemo(() => {
    let stockValue = 0;
    let totalCost = 0;

    portfolio.forEach((item) => {
      const stock = stocks.find((s) => s.ticker === item.ticker);
      const currentPrice = stock ? stock.price : item.avgBuyPrice;
      const curValue = item.lots * 100 * currentPrice;
      stockValue += curValue;
      totalCost += item.totalCost;
    });

    let rightValue = 0;
    rightHoldings.forEach((rh) => {
      rightValue += rh.rightsLots * 100 * rh.marketPrice;
    });

    const totalEquity = cashBalance + stockValue + rightValue;
    const floatingProfit = stockValue - totalCost;
    const floatingProfitPercent = totalCost > 0 ? (floatingProfit / totalCost) * 100 : 0;

    return {
      stockValue,
      rightValue,
      totalCost,
      totalEquity,
      floatingProfit,
      floatingProfitPercent,
    };
  }, [portfolio, stocks, rightHoldings, cashBalance]);

  // IHSG Calculation
  const ihsgData = useMemo(() => {
    const baseIHSG = 7320;
    let totalWeightedChange = 0;
    let totalCap = 0;

    stocks.forEach((s) => {
      totalWeightedChange += s.changePercent * s.marketCap;
      totalCap += s.marketCap;
    });

    const averagePercent = totalCap > 0 ? totalWeightedChange / totalCap : 0;
    const currentIHSG = baseIHSG * (1 + averagePercent / 100);
    const ihsgChange = currentIHSG - baseIHSG;

    return {
      value: Math.round(currentIHSG * 100) / 100,
      change: Math.round(ihsgChange * 100) / 100,
      changePercent: Math.round(averagePercent * 100) / 100,
    };
  }, [stocks]);

  // Quest progress checker
  const updateQuestProgress = useCallback(
    (actionType: 'BUY' | 'DIVIDEND' | 'RIGHT' | 'REALIZED_PROFIT' | 'PORTFOLIO_CHECK') => {
      setQuests((prev) =>
        prev.map((q) => {
          let updated = { ...q };

          if (q.id === 'quest-first-buy' && actionType === 'BUY') {
            updated.progress = 1;
            updated.completed = true;
          } else if (q.id === 'quest-dividend' && actionType === 'DIVIDEND') {
            updated.progress = 1;
            updated.completed = true;
          } else if (q.id === 'quest-right-issue' && actionType === 'RIGHT') {
            updated.progress = 1;
            updated.completed = true;
          } else if (q.id === 'quest-diversify') {
            const count = portfolio.length;
            updated.progress = Math.min(updated.maxProgress, count);
            if (count >= 3) updated.completed = true;
          } else if (q.id === 'quest-sultan-goal') {
            updated.progress = Math.min(updated.maxProgress, portfolioValuation.totalEquity);
            if (portfolioValuation.totalEquity >= updated.maxProgress) updated.completed = true;
          } else if (q.id === 'quest-ara-hunter') {
            const hasOver5Percent = portfolio.some((item) => {
              const s = stocks.find((st) => st.ticker === item.ticker);
              if (!s) return false;
              const pnlPercent = ((s.price - item.avgBuyPrice) / item.avgBuyPrice) * 100;
              return pnlPercent >= 5;
            });
            if (hasOver5Percent) {
              updated.progress = 1;
              updated.completed = true;
            }
          }

          return updated;
        })
      );
    },
    [portfolio, portfolioValuation.totalEquity, stocks]
  );

  // Claim Quest Reward
  const claimQuestReward = useCallback(
    (questId: string) => {
      setQuests((prev) =>
        prev.map((q) => {
          if (q.id === questId && q.completed && !q.claimed) {
            setCashBalance((c) => c + q.rewardCash);
            soundFx.playCuan();
            notify('success', 'Hadiah Misi Diklaim!', `Berhasil menerima hadiah tunai ${q.rewardCash.toLocaleString('id-ID')} ke saldo RDN!`);
            return { ...q, claimed: true };
          }
          return q;
        })
      );
    },
    [notify]
  );

  // Buy Stock Action
  const buyStock = useCallback(
    (ticker: string, lots: number, targetPrice?: number): { success: boolean; message: string } => {
      if (lots <= 0) return { success: false, message: 'Jumlah lot harus lebih dari 0!' };

      const targetStock = stocks.find((s) => s.ticker === ticker);
      if (!targetStock) return { success: false, message: 'Saham tidak ditemukan!' };

      const executionPrice = targetPrice ? snapToTick(targetPrice) : targetStock.price;

      // Check ARA / ARB bounds
      if (executionPrice > targetStock.araPrice) {
        soundFx.playAlert();
        return { success: false, message: `Harga melebihi batas ARA (Rp ${targetStock.araPrice.toLocaleString('id-ID')})!` };
      }
      if (executionPrice < targetStock.arbPrice) {
        soundFx.playAlert();
        return { success: false, message: `Harga di bawah batas ARB (Rp ${targetStock.arbPrice.toLocaleString('id-ID')})!` };
      }

      const grossAmount = lots * 100 * executionPrice;
      const fee = calculateBrokerFee(grossAmount, true);
      const totalCost = grossAmount + fee;

      if (cashBalance < totalCost) {
        soundFx.playAlert();
        return {
          success: false,
          message: `Saldo RDN tidak cukup! Diperlukan Rp ${totalCost.toLocaleString('id-ID')} (termasuk fee broker 0.15%).`,
        };
      }

      // Deduct cash
      setCashBalance((prev) => prev - totalCost);

      // Add to portfolio
      setPortfolio((prev) => {
        const existingIndex = prev.findIndex((p) => p.ticker === ticker);
        if (existingIndex >= 0) {
          const item = prev[existingIndex];
          const newLots = item.lots + lots;
          const newTotalCost = item.totalCost + totalCost;
          const newAvgPrice = Math.round(newTotalCost / (newLots * 100));

          const updated = [...prev];
          updated[existingIndex] = {
            ...item,
            lots: newLots,
            avgBuyPrice: newAvgPrice,
            totalCost: newTotalCost,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              ticker,
              lots,
              avgBuyPrice: Math.round(totalCost / (lots * 100)),
              totalCost,
            },
          ];
        }
      });

      // Record transaction
      const tx: TradeTransaction = {
        id: `tx-buy-${Date.now()}`,
        day: currentDay,
        time: sessionTime,
        ticker,
        type: 'BUY',
        price: executionPrice,
        lots,
        grossAmount,
        fee,
        netAmount: totalCost,
      };
      setTransactions((prev) => [tx, ...prev]);

      soundFx.playBuy();
      notify(
        'success',
        'Order Beli Berhasil (Done)',
        `Beli ${lots} Lot ${ticker} di harga Rp ${executionPrice.toLocaleString('id-ID')}. Total: Rp ${totalCost.toLocaleString('id-ID')}`
      );

      // Check quest
      setTimeout(() => updateQuestProgress('BUY'), 100);

      return { success: true, message: 'Pembelian berhasil dieksekusi.' };
    },
    [cashBalance, currentDay, notify, sessionTime, stocks, updateQuestProgress]
  );

  // Sell Stock Action
  const sellStock = useCallback(
    (ticker: string, lots: number, targetPrice?: number): { success: boolean; message: string } => {
      if (lots <= 0) return { success: false, message: 'Jumlah lot harus lebih dari 0!' };

      const existingHolding = portfolio.find((p) => p.ticker === ticker);
      if (!existingHolding || existingHolding.lots < lots) {
        soundFx.playAlert();
        return {
          success: false,
          message: `Lot tidak mencukupi! Anda memiliki ${existingHolding ? existingHolding.lots : 0} lot.`,
        };
      }

      const targetStock = stocks.find((s) => s.ticker === ticker);
      if (!targetStock) return { success: false, message: 'Saham tidak ditemukan!' };

      const executionPrice = targetPrice ? snapToTick(targetPrice) : targetStock.price;

      if (executionPrice > targetStock.araPrice) {
        soundFx.playAlert();
        return { success: false, message: `Harga melebihi batas ARA (Rp ${targetStock.araPrice.toLocaleString('id-ID')})!` };
      }
      if (executionPrice < targetStock.arbPrice) {
        soundFx.playAlert();
        return { success: false, message: `Harga di bawah batas ARB (Rp ${targetStock.arbPrice.toLocaleString('id-ID')})!` };
      }

      const grossAmount = lots * 100 * executionPrice;
      const fee = calculateBrokerFee(grossAmount, false); // 0.25% fee + PPh
      const netProceeds = grossAmount - fee;

      const costBasis = (existingHolding.totalCost / existingHolding.lots) * lots;
      const pnl = netProceeds - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      // Add cash
      setCashBalance((prev) => prev + netProceeds);

      // Deduct from portfolio
      setPortfolio((prev) => {
        const item = prev.find((p) => p.ticker === ticker)!;
        if (item.lots === lots) {
          return prev.filter((p) => p.ticker !== ticker);
        } else {
          return prev.map((p) => {
            if (p.ticker === ticker) {
              const remainingLots = p.lots - lots;
              const remainingCost = p.totalCost - costBasis;
              return {
                ...p,
                lots: remainingLots,
                totalCost: remainingCost,
              };
            }
            return p;
          });
        }
      });

      // Record transaction
      const tx: TradeTransaction = {
        id: `tx-sell-${Date.now()}`,
        day: currentDay,
        time: sessionTime,
        ticker,
        type: 'SELL',
        price: executionPrice,
        lots,
        grossAmount,
        fee,
        netAmount: netProceeds,
        profitLoss: pnl,
        profitLossPercent: pnlPercent,
      };
      setTransactions((prev) => [tx, ...prev]);

      if (pnl > 0) {
        soundFx.playCuan();
      } else {
        soundFx.playSell();
      }

      notify(
        pnl >= 0 ? 'success' : 'warning',
        'Order Jual Berhasil (Done)',
        `Jual ${lots} Lot ${ticker} di Rp ${executionPrice.toLocaleString('id-ID')}. Hasil bersih: Rp ${netProceeds.toLocaleString('id-ID')} (${pnl >= 0 ? '+' : ''}${Math.round(pnl).toLocaleString('id-ID')} / ${pnlPercent.toFixed(2)}%)`
      );

      // Check quests for realized profit
      if (pnl > 0) {
        setQuests((prev) =>
          prev.map((q) => {
            if (q.id === 'quest-realized-profit') {
              const newProg = q.progress + pnl;
              return {
                ...q,
                progress: Math.min(q.maxProgress, newProg),
                completed: newProg >= q.maxProgress,
              };
            }
            return q;
          })
        );
      }

      return { success: true, message: 'Penjualan berhasil dieksekusi.' };
    },
    [portfolio, stocks, currentDay, sessionTime, notify]
  );

  // Exercise Right Issue (Tebus HMETD)
  const exerciseRight = useCallback(
    (rightCode: string, lotsToExercise: number): { success: boolean; message: string } => {
      const right = rightHoldings.find((r) => r.code === rightCode);
      if (!right) return { success: false, message: 'Hak Right Issue tidak ditemukan!' };

      if (lotsToExercise <= 0 || lotsToExercise > right.rightsLots) {
        return { success: false, message: 'Jumlah lot tebus tidak valid atau melebihi hak yang dimiliki!' };
      }

      const exerciseCost = lotsToExercise * 100 * right.exercisePrice;

      if (cashBalance < exerciseCost) {
        soundFx.playAlert();
        return {
          success: false,
          message: `Saldo RDN tidak cukup untuk menebus! Butuh Rp ${exerciseCost.toLocaleString('id-ID')}.`,
        };
      }

      // Deduct cash for exercise
      setCashBalance((prev) => prev - exerciseCost);

      // Deduct from right holdings
      setRightHoldings((prev) => {
        return prev
          .map((r) => {
            if (r.code === rightCode) {
              const remaining = r.rightsLots - lotsToExercise;
              return remaining > 0 ? { ...r, rightsLots: remaining } : null;
            }
            return r;
          })
          .filter(Boolean) as RightIssueHolding[];
      });

      // Add parent stock shares to portfolio at exercise price
      setPortfolio((prev) => {
        const existingIndex = prev.findIndex((p) => p.ticker === right.parentTicker);
        if (existingIndex >= 0) {
          const item = prev[existingIndex];
          const newLots = item.lots + lotsToExercise;
          const newTotalCost = item.totalCost + exerciseCost;
          const newAvgPrice = Math.round(newTotalCost / (newLots * 100));

          const updated = [...prev];
          updated[existingIndex] = {
            ...item,
            lots: newLots,
            avgBuyPrice: newAvgPrice,
            totalCost: newTotalCost,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              ticker: right.parentTicker,
              lots: lotsToExercise,
              avgBuyPrice: right.exercisePrice,
              totalCost: exerciseCost,
            },
          ];
        }
      });

      // Record transaction
      const tx: TradeTransaction = {
        id: `tx-exercise-${Date.now()}`,
        day: currentDay,
        time: sessionTime,
        ticker: rightCode,
        type: 'EXERCISE_RIGHT',
        price: right.exercisePrice,
        lots: lotsToExercise,
        grossAmount: exerciseCost,
        fee: 0,
        netAmount: exerciseCost,
        note: `Tebus HMETD menjadi saham ${right.parentTicker} @ Rp ${right.exercisePrice}`,
      };
      setTransactions((prev) => [tx, ...prev]);

      soundFx.playCuan();
      notify(
        'success',
        'HMETD Berhasil Ditebus!',
        `Selamat! ${lotsToExercise} Lot ${rightCode} telah dikonversi menjadi saham ${right.parentTicker} pada harga tebus Rp ${right.exercisePrice.toLocaleString('id-ID')}.`
      );

      setTimeout(() => updateQuestProgress('RIGHT'), 100);

      return { success: true, message: 'HMETD berhasil ditebus menjadi saham induk.' };
    },
    [cashBalance, currentDay, notify, rightHoldings, sessionTime, updateQuestProgress]
  );

  // Sell Right Issue Certificate in Cash Market
  const sellRight = useCallback(
    (rightCode: string, lotsToSell: number, price: number): { success: boolean; message: string } => {
      const right = rightHoldings.find((r) => r.code === rightCode);
      if (!right) return { success: false, message: 'Hak Right Issue tidak ditemukan!' };

      if (lotsToSell <= 0 || lotsToSell > right.rightsLots) {
        return { success: false, message: 'Jumlah lot hak melebihi kepemilikan!' };
      }

      const gross = lotsToSell * 100 * price;
      const fee = calculateBrokerFee(gross, false);
      const netProceeds = gross - fee;

      setCashBalance((prev) => prev + netProceeds);

      setRightHoldings((prev) =>
        prev
          .map((r) => {
            if (r.code === rightCode) {
              const rem = r.rightsLots - lotsToSell;
              return rem > 0 ? { ...r, rightsLots: rem } : null;
            }
            return r;
          })
          .filter(Boolean) as RightIssueHolding[]
      );

      const tx: TradeTransaction = {
        id: `tx-rights-sell-${Date.now()}`,
        day: currentDay,
        time: sessionTime,
        ticker: rightCode,
        type: 'RIGHT_SELL',
        price,
        lots: lotsToSell,
        grossAmount: gross,
        fee,
        netAmount: netProceeds,
        note: `Jual sertifikat ${rightCode} di pasar tunai`,
      };
      setTransactions((prev) => [tx, ...prev]);

      soundFx.playSell();
      notify(
        'success',
        'Penjualan HMETD Berhasil',
        `Berhasil menjual ${lotsToSell} Lot sertifikat ${rightCode} seharga Rp ${netProceeds.toLocaleString('id-ID')}.`
      );

      setTimeout(() => updateQuestProgress('RIGHT'), 100);

      return { success: true, message: 'Sertifikat HMETD berhasil dijual.' };
    },
    [currentDay, notify, rightHoldings, sessionTime, updateQuestProgress]
  );

  // Buy Right Issue Certificate from Secondary Market
  const buyRight = useCallback(
    (rightCode: string, lotsToBuy: number, price: number): { success: boolean; message: string } => {
      if (lotsToBuy <= 0) return { success: false, message: 'Jumlah lot tidak valid!' };

      // Find matching corporate action
      const ca = corporateActions.find(
        (c) => c.type === 'RIGHT_ISSUE' && `${c.ticker}-R` === rightCode
      );
      if (!ca) return { success: false, message: 'Data Right Issue tidak ditemukan!' };

      const gross = lotsToBuy * 100 * price;
      const fee = calculateBrokerFee(gross, true);
      const totalCost = gross + fee;

      if (cashBalance < totalCost) {
        soundFx.playAlert();
        return { success: false, message: 'Saldo RDN tidak mencukupi untuk membeli hak HMETD!' };
      }

      setCashBalance((prev) => prev - totalCost);

      setRightHoldings((prev) => {
        const existing = prev.find((r) => r.code === rightCode);
        if (existing) {
          return prev.map((r) =>
            r.code === rightCode ? { ...r, rightsLots: r.rightsLots + lotsToBuy } : r
          );
        } else {
          return [
            ...prev,
            {
              code: rightCode,
              parentTicker: ca.ticker,
              rightsLots: lotsToBuy,
              exercisePrice: ca.rightIssuePrice || 50,
              marketPrice: price,
              expiryDay: ca.paymentDate,
              ratio: `${ca.rightRatio?.old || 100} : ${ca.rightRatio?.new || 25}`,
            },
          ];
        }
      });

      const tx: TradeTransaction = {
        id: `tx-rights-buy-${Date.now()}`,
        day: currentDay,
        time: sessionTime,
        ticker: rightCode,
        type: 'RIGHT_BUY',
        price,
        lots: lotsToBuy,
        grossAmount: gross,
        fee,
        netAmount: totalCost,
        note: `Beli sertifikat hak ${rightCode} di pasar tunai`,
      };
      setTransactions((prev) => [tx, ...prev]);

      soundFx.playBuy();
      notify(
        'success',
        'Pembelian HMETD Berhasil',
        `Membeli ${lotsToBuy} Lot sertifikat ${rightCode}. Anda dapat menebusnya sebelum Hari ke-${ca.paymentDate}.`
      );

      return { success: true, message: 'Pembelian sertifikat HMETD berhasil.' };
    },
    [cashBalance, corporateActions, currentDay, notify, sessionTime]
  );

  // Process day advance & Corporate Actions execution
  const advanceToNextDay = useCallback(() => {
    const nextDay = currentDay + 1;
    setCurrentDay(nextDay);
    setSessionTime('09:00 WIB (Sesi 1)');

    // 1. Check Corporate Actions for today
    let newlyAwardedCash = 0;
    const updatedCAs = corporateActions.map((ca) => {
      const copy = { ...ca };

      // A. CUM DATE: Check if user holds the stock to award Right Issue or register for Dividend
      if (nextDay > ca.cumDate && !copy.executedCum) {
        copy.executedCum = true;
        const userHolding = portfolio.find((p) => p.ticker === ca.ticker);

        if (userHolding && userHolding.lots > 0) {
          if (ca.type === 'RIGHT_ISSUE' && ca.rightRatio) {
            // Calculate rights received: (holdingLots * new) / old
            const rightsLots = Math.floor((userHolding.lots * ca.rightRatio.new) / ca.rightRatio.old);
            if (rightsLots > 0) {
              const rightCode = `${ca.ticker}-R`;
              // Market initial trading price of right issue: (CumPrice - ExercisePrice) or ~20% of share price
              const parentStock = stocks.find((s) => s.ticker === ca.ticker);
              const estMarketPrice = Math.max(
                5,
                snapToTick((parentStock ? parentStock.price : 100) - (ca.rightIssuePrice || 50))
              );

              setRightHoldings((prev) => {
                const exist = prev.find((r) => r.code === rightCode);
                if (exist) {
                  return prev.map((r) =>
                    r.code === rightCode ? { ...r, rightsLots: r.rightsLots + rightsLots } : r
                  );
                }
                return [
                  ...prev,
                  {
                    code: rightCode,
                    parentTicker: ca.ticker,
                    rightsLots,
                    exercisePrice: ca.rightIssuePrice || 50,
                    marketPrice: estMarketPrice,
                    expiryDay: ca.paymentDate,
                    ratio: `${ca.rightRatio?.old || 100} : ${ca.rightRatio?.new || 25}`,
                  },
                ];
              });

              notify(
                'info',
                'Hak HMETD Diterbitkan!',
                `Anda berhak atas ${rightsLots} Lot sertifikat ${rightCode}! Tebus di Pusat Right Issue sebelum Hari ke-${ca.paymentDate}.`
              );
            }
          }
        }
      }

      // B. EX DATE: Market price adjustments (Dividend Trap & Stock Split)
      if (nextDay >= ca.exDate && !copy.executedEx) {
        copy.executedEx = true;

        if (ca.type === 'DIVIDEND' && ca.dividendAmount) {
          // Stock price adjusts downwards by dividend per share
          setStocks((prev) =>
            prev.map((s) => {
              if (s.ticker === ca.ticker) {
                const drop = ca.dividendAmount || 100;
                const newPrice = Math.max(50, snapToTick(s.price - drop));
                const newPrev = newPrice;
                return {
                  ...s,
                  price: newPrice,
                  previousClose: newPrev,
                  change: -drop,
                  changePercent: -((drop / (s.price || 1)) * 100),
                };
              }
              return s;
            })
          );
          notify(
            'warning',
            `Ex Date Dividen: ${ca.ticker}`,
            `Hari ini adalah Ex Date dividen ${ca.ticker}. Terjadi penyesuaian harga (dividend trap effect) sebesar Rp ${ca.dividendAmount}/lembar.`
          );
        } else if (ca.type === 'STOCK_SPLIT' && ca.splitRatio) {
          const ratio = ca.splitRatio.new / ca.splitRatio.old;
          // Adjust stock price
          setStocks((prev) =>
            prev.map((s) => {
              if (s.ticker === ca.ticker) {
                const newPrice = snapToTick(s.price / ratio);
                return {
                  ...s,
                  price: newPrice,
                  previousClose: snapToTick(s.previousClose / ratio),
                };
              }
              return s;
            })
          );

          // Adjust user portfolio if they hold it
          setPortfolio((prev) =>
            prev.map((p) => {
              if (p.ticker === ca.ticker) {
                const newLots = p.lots * ratio;
                const newAvg = Math.round(p.avgBuyPrice / ratio);
                return {
                  ...p,
                  lots: newLots,
                  avgBuyPrice: newAvg,
                };
              }
              return p;
            })
          );

          notify(
            'success',
            `Stock Split Berlaku: ${ca.ticker}`,
            `Saham ${ca.ticker} resmi dipecah 1:${ratio}. Jumlah lot berlipat ${ratio}x dan harga nominal menyesuaikan.`
          );
        } else if (ca.type === 'BONUS_SHARES' && ca.bonusRatio) {
          const bonusFraction = ca.bonusRatio.new / ca.bonusRatio.old;
          setPortfolio((prev) =>
            prev.map((p) => {
              if (p.ticker === ca.ticker) {
                const bonusLots = Math.floor(p.lots * bonusFraction);
                return {
                  ...p,
                  lots: p.lots + bonusLots,
                };
              }
              return p;
            })
          );
          notify(
            'success',
            `Saham Bonus: ${ca.ticker}`,
            `Pemegang saham ${ca.ticker} menerima distribusi saham bonus gratis!`
          );
        }
      }

      // C. PAYMENT DATE: Payout dividend cash or expire rights
      if (nextDay >= ca.paymentDate && !copy.executedPayment) {
        copy.executedPayment = true;

        if (ca.type === 'DIVIDEND' && ca.dividendAmount) {
          // If user held on cumDate
          const userHolding = portfolio.find((p) => p.ticker === ca.ticker);
          if (userHolding && userHolding.lots > 0) {
            const totalDiv = userHolding.lots * 100 * ca.dividendAmount;
            newlyAwardedCash += totalDiv;

            const tx: TradeTransaction = {
              id: `tx-div-${Date.now()}`,
              day: nextDay,
              time: '09:00 WIB',
              ticker: ca.ticker,
              type: 'DIVIDEND_PAYOUT',
              price: ca.dividendAmount,
              lots: userHolding.lots,
              grossAmount: totalDiv,
              fee: 0,
              netAmount: totalDiv,
              note: `Pembayaran dividen tunai Rp ${ca.dividendAmount}/lembar`,
            };
            setTransactions((prev) => [tx, ...prev]);

            notify(
              'success',
              'Dividen Masuk ke Rekening!',
              `Selamat! Dividen tunai ${ca.ticker} sebesar Rp ${totalDiv.toLocaleString('id-ID')} telah cair ke saldo RDN Anda.`
            );

            setTimeout(() => updateQuestProgress('DIVIDEND'), 150);
          }
        } else if (ca.type === 'RIGHT_ISSUE') {
          const rightCode = `${ca.ticker}-R`;
          // Expire remaining unexercised rights
          setRightHoldings((prev) => {
            const remaining = prev.find((r) => r.code === rightCode);
            if (remaining && remaining.rightsLots > 0) {
              notify(
                'warning',
                `HMETD ${rightCode} Telah Hangus (Expired)`,
                `Periode perdagangan dan penebusan ${rightCode} telah berakhir. Hak yang tidak ditebus telah hangus.`
              );
            }
            return prev.filter((r) => r.code !== rightCode);
          });
        }
      }

      return copy;
    });

    if (newlyAwardedCash > 0) {
      setCashBalance((c) => c + newlyAwardedCash);
      soundFx.playCuan();
    }

    setCorporateActions(updatedCAs);

    // 2. Trigger new daily news items matching nextDay
    const dayNews = news.filter((n) => n.day === nextDay);
    if (dayNews.length > 0) {
      notify('info', 'Warta Pasar Terkini', `${dayNews.length} berita bursa baru dirilis pagi ini.`);
    }

    // 3. Daily Stock Price Simulation Shift
    setStocks((prev) =>
      prev.map((s) => {
        // Find if any news affects this stock today
        const matchingNews = news.find((n) => n.day === nextDay && n.relatedTicker === s.ticker);
        let bias = (Math.random() - 0.49) * 0.03; // +/- 1.5% regular drift
        if (matchingNews) {
          bias += (matchingNews.impactPercent / 100) * 0.8;
        }

        const newClose = snapToTick(s.price * (1 + bias));
        const boundedPrice = Math.min(s.araPrice, Math.max(s.arbPrice, newClose));
        const change = boundedPrice - s.price;
        const changePercent = (change / s.price) * 100;
        const high = Math.max(s.price, boundedPrice, snapToTick(boundedPrice * 1.015));
        const low = Math.min(s.price, boundedPrice, snapToTick(boundedPrice * 0.985));
        const volume = Math.floor(40000 + Math.random() * 95000);

        const newCandle = {
          time: `Hari ke-${nextDay}`,
          open: s.price,
          high,
          low,
          close: boundedPrice,
          volume,
        };

        const updatedHistory = [...s.history.slice(1), newCandle];

        return {
          ...s,
          previousClose: s.price,
          openPrice: s.price,
          price: boundedPrice,
          high,
          low,
          change,
          changePercent,
          volume,
          turnover: volume * 100 * boundedPrice,
          history: updatedHistory,
        };
      })
    );

    // Check portfolio quests
    setTimeout(() => updateQuestProgress('PORTFOLIO_CHECK'), 200);
  }, [
    currentDay,
    corporateActions,
    portfolio,
    stocks,
    news,
    notify,
    updateQuestProgress,
  ]);

  // Periodic Intra-day Simulation loop based on simSpeed
  const lastTickRef = useRef<number>(Date.now());
  useEffect(() => {
    if (simSpeed === 'pause') return;

    const intervalMs = simSpeed === '1x' ? 3200 : simSpeed === '2x' ? 1600 : 700;

    const interval = setInterval(() => {
      // Rotate session clock
      const sessions = [
        '09:15 WIB (Sesi 1)',
        '10:30 WIB (Sesi 1)',
        '11:15 WIB (Sesi 1)',
        '13:45 WIB (Sesi 2)',
        '14:50 WIB (Sesi 2)',
        '15:40 WIB (Pre-Closing)',
      ];
      setSessionTime((prev) => {
        const curIdx = sessions.indexOf(prev);
        if (curIdx === -1 || curIdx === sessions.length - 1) {
          return sessions[0];
        }
        return sessions[curIdx + 1];
      });

      // Small price and orderbook fluctuation for active market
      setStocks((prev) =>
        prev.map((s) => {
          // 40% chance of a micro tick in price
          if (Math.random() > 0.45) return s;

          const tick = getFractionTick(s.price);
          const dir = Math.random() > 0.49 ? 1 : -1;
          const candidate = s.price + dir * tick;

          if (candidate > s.araPrice || candidate < s.arbPrice) return s;

          const newPrice = Math.max(50, candidate);
          const change = newPrice - s.previousClose;
          const changePercent = (change / s.previousClose) * 100;

          // Update latest candle close
          const updatedHistory = [...s.history];
          if (updatedHistory.length > 0) {
            const lastCandle = updatedHistory[updatedHistory.length - 1];
            updatedHistory[updatedHistory.length - 1] = {
              ...lastCandle,
              high: Math.max(lastCandle.high, newPrice),
              low: Math.min(lastCandle.low, newPrice),
              close: newPrice,
              volume: lastCandle.volume + Math.floor(10 + Math.random() * 80),
            };
          }

          // Fluctuate orderbook
          const bids = s.orderBook.bids.map((b, i) => ({
            ...b,
            lots: Math.max(100, b.lots + Math.floor((Math.random() - 0.5) * 200)),
          }));
          const asks = s.orderBook.asks.map((a, i) => ({
            ...a,
            lots: Math.max(100, a.lots + Math.floor((Math.random() - 0.5) * 200)),
          }));

          return {
            ...s,
            price: newPrice,
            change,
            changePercent,
            high: Math.max(s.high, newPrice),
            low: Math.min(s.low, newPrice),
            history: updatedHistory,
            orderBook: { bids, asks },
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(interval);
  }, [simSpeed]);

  // Reset entire simulation to beginning
  const resetGame = useCallback(() => {
    localStorage.clear();
    setCashBalance(INITIAL_CASH);
    setPortfolio([]);
    setRightHoldings([]);
    setStocks(initialStocks);
    setCorporateActions(initialCorporateActions);
    setNews(initialNews);
    setTransactions([]);
    setQuests(initialQuests);
    setCurrentDay(1);
    setSelectedTicker('BBRI');
    setSessionTime('09:30 WIB (Sesi 1)');
    notify('info', 'Permainan Direset', 'Semua data pasar, portofolio, dan transaksi telah dikembalikan ke awal.');
  }, [notify]);

  return {
    cashBalance,
    portfolio,
    rightHoldings,
    stocks,
    activeStock,
    corporateActions,
    news,
    transactions,
    quests,
    currentDay,
    sessionTime,
    simSpeed,
    soundEnabled,
    notifications,
    portfolioValuation,
    ihsgData,
    selectedTicker,
    setSelectedTicker,
    setSimSpeed,
    setSoundEnabled,
    buyStock,
    sellStock,
    exerciseRight,
    sellRight,
    buyRight,
    advanceToNextDay,
    claimQuestReward,
    resetGame,
    dismissNotification,
    notify,
  };
}
