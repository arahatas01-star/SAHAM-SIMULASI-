import React, { useState } from 'react';
import { useStockMarket } from './hooks/useStockMarket';
import { Header } from './components/Header';
import { MarketOverview } from './components/MarketOverview';
import { StockTradingDesk } from './components/StockTradingDesk';
import { RightIssueCenter } from './components/RightIssueCenter';
import { CorporateActionsTab } from './components/CorporateActionsTab';
import { PortfolioView } from './components/PortfolioView';
import { NewsFeed } from './components/NewsFeed';
import { TradingQuests } from './components/TradingQuests';
import { NotificationToast } from './components/NotificationToast';
import {
  TrendingUp,
  Coins,
  Calendar,
  Wallet,
  Newspaper,
  BookOpen,
  Info,
} from 'lucide-react';

export default function App() {
  const {
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
  } = useStockMarket();

  const [activeTab, setActiveTab] = useState<
    'TRADING' | 'RIGHT_ISSUE' | 'CORPORATE_ACTIONS' | 'PORTFOLIO' | 'NEWS'
  >('TRADING');
  const [isQuestsOpen, setIsQuestsOpen] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(true);

  // Active holding of currently selected stock
  const currentHolding = portfolio.find((p) => p.ticker === activeStock.ticker);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Header with live financial HUD */}
      <Header
        cashBalance={cashBalance}
        stockValue={portfolioValuation.stockValue}
        totalEquity={portfolioValuation.totalEquity}
        floatingProfit={portfolioValuation.floatingProfit}
        floatingProfitPercent={portfolioValuation.floatingProfitPercent}
        ihsgData={ihsgData}
        currentDay={currentDay}
        sessionTime={sessionTime}
        simSpeed={simSpeed}
        soundEnabled={soundEnabled}
        quests={quests}
        onSetSimSpeed={setSimSpeed}
        onAdvanceDay={advanceToNextDay}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenQuests={() => setIsQuestsOpen(true)}
        onResetGame={resetGame}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* Quick Education Tips Bar */}
        {showTips && (
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3 flex items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Info className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong>Aturan Riil Bursa Efek Indonesia (BEI):</strong> 1 Lot = 100 Lembar saham. Beli saham sebelum <strong>Cum Date</strong> untuk hak dividen/HMETD. Jangan biarkan sertifikat <strong>Right Issue (HMETD)</strong> hangus tanpa ditebus atau dijual!
              </span>
            </div>
            <button
              onClick={() => setShowTips(false)}
              className="text-slate-400 hover:text-white text-[11px] shrink-0 underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Primary Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('TRADING')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
              activeTab === 'TRADING'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Terminal Trading</span>
          </button>

          <button
            onClick={() => setActiveTab('RIGHT_ISSUE')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 relative ${
              activeTab === 'RIGHT_ISSUE'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-300" />
            <span>Pusat Right Issue (HMETD)</span>
            {rightHoldings.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('CORPORATE_ACTIONS')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
              activeTab === 'CORPORATE_ACTIONS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Aksi Korporasi & Dividen</span>
          </button>

          <button
            onClick={() => setActiveTab('PORTFOLIO')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
              activeTab === 'PORTFOLIO'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Portofolio & Riwayat ({portfolio.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('NEWS')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
              activeTab === 'NEWS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Warta Berita IDX</span>
          </button>
        </div>

        {/* Tab 1: Terminal Trading (Market Overview + Trading Desk) */}
        {activeTab === 'TRADING' && (
          <div className="flex flex-col gap-5">
            <MarketOverview
              stocks={stocks}
              selectedTicker={selectedTicker}
              onSelectStock={(t) => setSelectedTicker(t)}
            />

            <StockTradingDesk
              stock={activeStock}
              cashBalance={cashBalance}
              userHolding={currentHolding}
              onBuy={buyStock}
              onSell={sellStock}
            />
          </div>
        )}

        {/* Tab 2: Pusat Right Issue (HMETD) */}
        {activeTab === 'RIGHT_ISSUE' && (
          <RightIssueCenter
            rightHoldings={rightHoldings}
            corporateActions={corporateActions}
            stocks={stocks}
            cashBalance={cashBalance}
            currentDay={currentDay}
            onExercise={exerciseRight}
            onSellRight={sellRight}
            onBuyRight={buyRight}
          />
        )}

        {/* Tab 3: Aksi Korporasi & Dividen */}
        {activeTab === 'CORPORATE_ACTIONS' && (
          <CorporateActionsTab
            corporateActions={corporateActions}
            portfolio={portfolio}
            stocks={stocks}
            currentDay={currentDay}
          />
        )}

        {/* Tab 4: Portofolio & Riwayat */}
        {activeTab === 'PORTFOLIO' && (
          <PortfolioView
            portfolio={portfolio}
            rightHoldings={rightHoldings}
            stocks={stocks}
            cashBalance={cashBalance}
            stockValue={portfolioValuation.stockValue}
            totalEquity={portfolioValuation.totalEquity}
            floatingProfit={portfolioValuation.floatingProfit}
            floatingProfitPercent={portfolioValuation.floatingProfitPercent}
            transactions={transactions}
            onSelectStock={(t) => {
              setSelectedTicker(t);
              setActiveTab('TRADING');
            }}
            onNavigateToRights={() => setActiveTab('RIGHT_ISSUE')}
          />
        )}

        {/* Tab 5: Warta Berita IDX */}
        {activeTab === 'NEWS' && (
          <NewsFeed
            news={news}
            portfolio={portfolio}
            currentDay={currentDay}
            onSelectStock={(t) => {
              setSelectedTicker(t);
              setActiveTab('TRADING');
            }}
          />
        )}
      </main>

      {/* Floating Quests Modal */}
      <TradingQuests
        isOpen={isQuestsOpen}
        quests={quests}
        onClose={() => setIsQuestsOpen(false)}
        onClaimReward={claimQuestReward}
      />

      {/* Notification Toasts */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
