/**
 * Format number to Indonesian Rupiah (Rp)
 */
export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format compact Rupiah (e.g., Rp 1,5 Jt, Rp 2,4 M, Rp 120 T)
 */
export function formatCompactRupiah(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  let result = '';

  if (abs >= 1_000_000_000_000) {
    result = `Rp ${(abs / 1_000_000_000_000).toFixed(1).replace('.', ',')} T`;
  } else if (abs >= 1_000_000_000) {
    result = `Rp ${(abs / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  } else if (abs >= 1_000_000) {
    result = `Rp ${(abs / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
  } else if (abs >= 1_000) {
    result = `Rp ${(abs / 1_000).toFixed(0)} rb`;
  } else {
    result = `Rp ${Math.round(abs)}`;
  }

  return isNegative ? `-${result}` : result;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.round(num));
}

/**
 * Format percentage with + or - sign
 */
export function formatPercent(percent: number, showSign = true): string {
  const prefix = showSign && percent > 0 ? '+' : '';
  return `${prefix}${percent.toFixed(2)}%`;
}

/**
 * Format lot size with "Lot" suffix
 */
export function formatLot(lots: number): string {
  return `${formatNumber(lots)} Lot (${formatNumber(lots * 100)} lembar)`;
}

/**
 * Official Bursa Efek Indonesia (BEI) Fraksi Harga (Tick Size Rules)
 * - Kelompok Harga < Rp 200: Fraksi Rp 1
 * - Kelompok Harga Rp 200 - Rp 500: Fraksi Rp 2
 * - Kelompok Harga Rp 500 - Rp 2.000: Fraksi Rp 5
 * - Kelompok Harga Rp 2.000 - Rp 5.000: Fraksi Rp 10
 * - Kelompok Harga >= Rp 5.000: Fraksi Rp 25
 */
export function getFractionTick(price: number): number {
  if (price < 200) return 1;
  if (price < 500) return 2;
  if (price < 2000) return 5;
  if (price < 5000) return 10;
  return 25;
}

/**
 * Snap price to valid IDX tick
 */
export function snapToTick(price: number): number {
  if (price <= 50) return 50; // IDX regular board minimum is Rp 50 (unless akselerasi)
  const tick = getFractionTick(price);
  return Math.round(price / tick) * tick;
}

/**
 * Calculate ARA (Auto Rejection Atas) based on previous close price
 * - Harga Rp 50 - Rp 200: +35%
 * - Harga > Rp 200 - Rp 5.000: +25%
 * - Harga > Rp 5.000: +20%
 */
export function calculateARA(prevClose: number): number {
  let percentage = 0.25;
  if (prevClose < 200) {
    percentage = 0.35;
  } else if (prevClose > 5000) {
    percentage = 0.20;
  }
  const rawAra = prevClose * (1 + percentage);
  return snapToTick(Math.floor(rawAra));
}

/**
 * Calculate ARB (Auto Rejection Bawah) - standard symmetric BEI ARB
 * - Minimum floor is Rp 50
 */
export function calculateARB(prevClose: number): number {
  let percentage = 0.25;
  if (prevClose < 200) {
    percentage = 0.35;
  } else if (prevClose > 5000) {
    percentage = 0.20;
  }
  const rawArb = prevClose * (1 - percentage);
  const snapped = snapToTick(Math.ceil(rawArb));
  return Math.max(50, snapped);
}

/**
 * Broker Fees in IDX:
 * - Beli: 0.15% (Fee broker + levy bursa)
 * - Jual: 0.25% (Fee broker 0.15% + PPh Final 0.10%)
 */
export function calculateBrokerFee(grossAmount: number, isBuy: boolean): number {
  const rate = isBuy ? 0.0015 : 0.0025;
  return Math.round(grossAmount * rate);
}

/**
 * Calculate Theoretical Price for Right Issue (HMETD)
 * Formula: P_teoritis = ( (P_cum * N_old) + (P_exercise * N_new) ) / (N_old + N_new)
 */
export function calculateTheoreticalRightPrice(
  cumPrice: number,
  exercisePrice: number,
  oldRatio: number,
  newRatio: number
): number {
  const numerator = (cumPrice * oldRatio) + (exercisePrice * newRatio);
  const denominator = oldRatio + newRatio;
  return Math.round(numerator / denominator);
}

/**
 * Calculate Dilution Percentage if rights are not exercised
 * Dilution % = (N_new / (N_old + N_new)) * 100
 */
export function calculateDilution(oldRatio: number, newRatio: number): number {
  return (newRatio / (oldRatio + newRatio)) * 100;
}

/**
 * Simple sound synthesizer using browser AudioContext
 */
class SoundFx {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy initialized
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  playBuy() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  playSell() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  }

  playCuan() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    });
  }

  playAlert() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }
}

export const soundFx = new SoundFx();
