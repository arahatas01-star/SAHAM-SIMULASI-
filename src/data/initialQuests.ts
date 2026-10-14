import { Quest, TraderRank } from '../types/market';

export const initialQuests: Quest[] = [
  {
    id: 'quest-first-buy',
    title: 'Investor Perdana',
    description: 'Beli minimal 1 lot saham emiten apapun di Bursa Efek Indonesia.',
    rewardCash: 500000,
    xp: 50,
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    category: 'TRADING',
  },
  {
    id: 'quest-dividend',
    title: 'Pemburu Dividen',
    description: 'Pegang saham emiten hingga Cum Date dan nikmati pencairan dividen tunai ke RDN.',
    rewardCash: 1000000,
    xp: 100,
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    category: 'CORPORATE_ACTION',
  },
  {
    id: 'quest-right-issue',
    title: 'Aksi HMETD (Right Issue)',
    description: 'Tebus hak Right Issue (Exercise) atau jual sertifikat hak di pasar tunai.',
    rewardCash: 1500000,
    xp: 150,
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    category: 'RIGHT_ISSUE',
  },
  {
    id: 'quest-diversify',
    title: 'Diversifikasi Portofolio',
    description: 'Miliki portofolio aktif yang terdiri dari minimal 3 emiten berbeda.',
    rewardCash: 1250000,
    xp: 120,
    progress: 0,
    maxProgress: 3,
    completed: false,
    claimed: false,
    category: 'TRADING',
  },
  {
    id: 'quest-ara-hunter',
    title: 'Hunter Cuan Hijau',
    description: 'Raih keuntungan mengambang (floating profit) di atas 5% pada satu saham.',
    rewardCash: 2000000,
    xp: 200,
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    category: 'PROFIT',
  },
  {
    id: 'quest-realized-profit',
    title: 'Realisasi Cuan',
    description: 'Jual saham dengan keuntungan bersih terealisasi minimal Rp 1.000.000.',
    rewardCash: 2500000,
    xp: 250,
    progress: 0,
    maxProgress: 1000000,
    completed: false,
    claimed: false,
    category: 'PROFIT',
  },
  {
    id: 'quest-sultan-goal',
    title: 'Menuju Sultan IDX',
    description: 'Kembangkan total nilai ekuitas akun Anda hingga menembus Rp 40.000.000.',
    rewardCash: 5000000,
    xp: 500,
    progress: 20000000,
    maxProgress: 40000000,
    completed: false,
    claimed: false,
    category: 'PROFIT',
  },
];

export const traderRanks: TraderRank[] = [
  {
    title: 'Ritel Pemula',
    level: 1,
    minNetWorth: 0,
    badgeColor: 'text-slate-400 bg-slate-800/80 border-slate-700',
    iconName: 'User',
  },
  {
    title: 'Swing Trader',
    level: 2,
    minNetWorth: 25000000,
    badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
    iconName: 'TrendingUp',
  },
  {
    title: 'Scalper Andal',
    level: 3,
    minNetWorth: 40000000,
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    iconName: 'Zap',
  },
  {
    title: 'Bandar Hunter',
    level: 4,
    minNetWorth: 75000000,
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    iconName: 'ShieldAlert',
  },
  {
    title: 'Sultan IDX',
    level: 5,
    minNetWorth: 150000000,
    badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    iconName: 'Crown',
  },
];

export function getRankForEquity(equity: number): TraderRank {
  for (let i = traderRanks.length - 1; i >= 0; i--) {
    if (equity >= traderRanks[i].minNetWorth) {
      return traderRanks[i];
    }
  }
  return traderRanks[0];
}
