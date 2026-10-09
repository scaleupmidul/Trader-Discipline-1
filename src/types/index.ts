export type PsychologyState =
  | 'Calm'
  | 'Focused'
  | 'Fear'
  | 'Greed'
  | 'FOMO'
  | 'Revenge'
  | 'Overconfident'
  | 'Impatient';

export type MistakeCategory =
  | 'FOMO'
  | 'Revenge trade'
  | 'Overtrading'
  | 'Early entry'
  | 'Late entry'
  | 'Ignored confirmation'
  | 'Moved SL'
  | 'Risk too high'
  | 'Exited too early'
  | 'Ignored trading plan'
  | 'Other';

export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  createdAt: string;
}

export interface DailyPractice {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  marketPreparation: boolean;
  economicNewsChecked: boolean;
  marketStructureAnalysis: boolean;
  keyLevelsIdentified: boolean;
  liquidityAnalysis: boolean;
  tradingBiasWritten: boolean;
  tradingPlanPrepared: boolean;
  riskPlanPrepared: boolean;
  postMarketReviewCompleted: boolean;
  note: string;
  updatedAt: string;
}

export type TradeResult = 'Win' | 'Loss' | 'Breakeven' | 'Open';

export interface Trade {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  pair: string;
  type: 'Buy' | 'Sell';
  setup: string;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  riskPercent: string;
  reasonForEntry: string;
  screenshot?: string;
  result: TradeResult;
  followedPlan: boolean;
  note: string;
  psychologyState?: PsychologyState;
  createdAt: string;
}

export interface MistakeLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mistake: MistakeCategory;
  customMistake?: string;
  whyHappened: string;
  preventionPlan: string;
  createdAt: string;
}

export interface PsychologyLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  tradeId?: string;
  state: PsychologyState;
  note: string;
  createdAt: string;
}

export interface DailyReview {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  wellDone: string;
  mistakeMade: string;
  improveTomorrow: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  weekEndDate: string; // YYYY-MM-DD (Sunday)
  improvedThisWeek: string;
  mostRepeatedMistake: string;
  weakestSkill: string;
  strongestSkill: string;
  oneFocusNextWeek: string;
  updatedAt: string;
}

export interface SkillRecord {
  id: string;
  userId: string;
  skillName: string;
  practiceDays: number;
  lastPracticed: string; // YYYY-MM-DD
  personalNotes: string;
  updatedAt: string;
}

export const CORE_SKILLS = [
  'Market Structure',
  'Support & Resistance',
  'Liquidity',
  'Price Action',
  'Candlestick Analysis',
  'Entry Confirmation',
  'Risk Management',
  'Trade Management',
  'Trading Psychology',
] as const;

export const COMMON_MISTAKES: MistakeCategory[] = [
  'FOMO',
  'Revenge trade',
  'Overtrading',
  'Early entry',
  'Late entry',
  'Ignored confirmation',
  'Moved SL',
  'Risk too high',
  'Exited too early',
  'Ignored trading plan',
  'Other',
];

export const PSYCHOLOGY_STATES: PsychologyState[] = [
  'Calm',
  'Focused',
  'Fear',
  'Greed',
  'FOMO',
  'Revenge',
  'Overconfident',
  'Impatient',
];

// ==========================================
// H1 SHARP V2 & LIQUIDITY EVENT TYPES
// ==========================================

export type TradingStrategy = 'LSE' | 'DRE';
export type TradingInstrument = 'XAU/USD' | 'BTC/USD' | 'Other';
export type TradeOutcomeType = 'TP' | 'SL' | 'Breakeven' | 'Manual Exit' | 'No Trade';

export type LiquidityLevelTaken =
  | 'Previous High'
  | 'Previous Low'
  | 'Equal Highs'
  | 'Equal Lows'
  | 'Other';

export type LiquidityEventOutcome =
  | 'Sweep + Reversal'
  | 'Break + Continuation (BOS)'
  | 'Unclear';

export type LiquiditySweptType = 'High' | 'Low';

export type BosDirection = 'Bullish' | 'Bearish';

// ==========================================
// TRADING BACKTESTING SYSTEM TYPES (LSE & DRE STRATEGIES)
// ==========================================

export type TradingSession =
  | 'Asian'
  | 'London'
  | 'New York'
  | 'London + New York'
  | 'Other / Unknown';

export type MSP1Session = TradingSession;

export type H1Bias = 'Bullish' | 'Bearish' | 'Neutral / Unclear' | 'Unclear';

export type H1StructureType = 'HH + HL' | 'LH + LL' | 'Range';

export type ImportantKeyLevel = 'Demand' | 'Supply' | 'Support' | 'Resistance';

export type LevelQuality = 'Strong' | 'Average' | 'Weak';

export type H1MSSDirection = 'Bullish MSS' | 'Bearish MSS' | 'No MSS';
export type MSP1MSSDirection = H1MSSDirection;

export type H1PrevStructure = 'Bearish' | 'Bullish' | 'Unclear';
export type MSP1H1PrevStructure = H1PrevStructure;

export type H1LastSwing = 'Last LH' | 'Last HL' | 'Not applicable';
export type MSP1LastSwing = H1LastSwing;

export type H1StructureBreak = 'Above Last LH' | 'Below Last HL' | 'No Break';
export type MSP1StructureBreak = H1StructureBreak;

export type TriggerDirection = 'Bullish' | 'Bearish' | 'None';
export type MSP1TriggerDirection = TriggerDirection;

export type PriceActionTrigger =
  | 'Strong Bullish Rejection'
  | 'Strong Bearish Rejection'
  | 'Bullish Engulfing'
  | 'Bearish Engulfing'
  | 'Other'
  | 'None';
export type MSP1PriceActionTrigger = PriceActionTrigger;

export type TradeDirection = 'BUY' | 'SELL' | 'NO TRADE';
export type MSP1TradeDirection = TradeDirection;

export type TradeResultStatus =
  | 'Win'
  | 'Loss'
  | 'Breakeven'
  | 'No Trade'
  | 'Invalid Setup'
  | 'Incomplete Setup';
export type MSP1Result = TradeResultStatus;

export type HighImpactNewsOption = 'Yes' | 'No' | 'Unknown';
export type MSP1HighImpactNews = HighImpactNewsOption;

export type MarketConditionOption = 'Trending' | 'Ranging' | 'Choppy' | 'Unclear';
export type MSP1MarketCondition = MarketConditionOption;

export type PullbackType = 'Healthy pullback' | 'Weak pullback' | 'No pullback';
export type MSP1PullbackType = PullbackType;

export type EntryQuality = 'A' | 'B' | 'C';

export type LossReason =
  | 'Wrong H1 bias'
  | 'Wrong key level'
  | 'False MSS'
  | 'Weak pullback'
  | 'False trigger'
  | 'Opposing zone'
  | 'SL too tight'
  | 'Normal loss'
  | 'Other';

export interface TradeScreenshots {
  beforeEntry?: string;
  entry?: string;
  afterTrade?: string;
  h1?: string;
  m15?: string;
  other?: string[];
}
export type MSP1Screenshots = TradeScreenshots;

export interface TradingSetup {
  id: string;
  userId: string;
  setupId: string; // e.g. "TR-0001"
  date: string; // YYYY-MM-DD
  market: string; // "XAU/USD" | "BTC/USD"
  instrument?: string; // alias for market
  session: TradingSession;
  timeframeRange?: string; // e.g. "2026-08-01 08:00 - 11:30 UTC"

  // Strategy Distinction (LSE vs DRE)
  strategy?: TradingStrategy; // 'LSE' (Liquidity Sweep Entry) or 'DRE' (Demand Reaction Entry)
  strategyVersion?: string; // e.g. "v1.0", "v2.0"

  // Dedicated Section: Liquidity Event (Level Break ≠ Liquidity Sweep)
  liquidityEventOccurred?: boolean; // Was a previous important High/Low taken? (YES / NO)
  liquidityLevelTaken?: LiquidityLevelTaken | boolean; // What was taken? (or boolean in legacy seeds)
  liquidityEventOutcome?: LiquidityEventOutcome; // 1. Sweep + Reversal | 2. Break + Continuation (BOS) | 3. Unclear
  liquidityOutcome?: LiquidityEventOutcome | string; // Legacy alias for liquidityEventOutcome
  liquidityWhatTaken?: LiquidityLevelTaken | string; // Legacy alias for liquidityLevelTaken
  liquiditySwept?: LiquiditySweptType | string; // Legacy alias for sweepLiquidityType
  liquidityRejection?: boolean; // Legacy alias for sweepRejectionVisible
  liquidityReclaimed?: boolean; // Legacy alias for sweepPriceReclaimed
  liquidityOppositeMss?: boolean; // Legacy alias for sweepOppositeMss
  liquidityDisplacement?: boolean; // Legacy alias for sweepStrongDisplacement
  mssDirection?: string; // Legacy alias for h1MssDirection / m15MssDirection

  // Sweep + Reversal Details (LSE criteria)
  liquiditySweepConfirmed?: boolean; // Yes / No
  sweepLiquidityType?: LiquiditySweptType; // High / Low
  sweepRejectionVisible?: boolean; // Rejection visible? YES / NO
  sweepPriceReclaimed?: boolean; // Price reclaimed the level? YES / NO
  sweepOppositeMss?: boolean; // Opposite MSS occurred? YES / NO
  sweepStrongDisplacement?: boolean; // Strong displacement after MSS? YES / NO

  // Break + Continuation (BOS) Details
  bosLevelBroken?: string; // Previous High/Low broken
  bosDirection?: BosDirection; // Bullish / Bearish
  bosPriceContinued?: boolean; // Price continued in the same direction? YES / NO
  bosOppositeMss?: boolean; // Opposite MSS occurred? YES / NO

  // Section: H1 Structure & Levels
  h1Bias?: H1Bias;
  h1StructureType?: H1StructureType;
  importantLevel?: ImportantKeyLevel;
  levelQuality?: LevelQuality;
  h1KeyZoneType?: 'Support' | 'Demand' | 'Resistance' | 'Supply' | 'None';

  // Section: 1H Confirmation
  h1PrevStructure?: H1PrevStructure;
  h1MssDirection?: H1MSSDirection;
  h1LastSwing?: H1LastSwing;
  h1StructureBreak?: H1StructureBreak;
  h1CandleCloseConfirmed?: boolean;
  h1Screenshot?: string;

  // M15 Confirmation & FVG
  mssConfirmed?: boolean;
  displacementConfirmed?: boolean;
  fvgPresent?: boolean;
  fvgUsedAsConfirmation?: boolean;

  // Section: 15M / Trigger
  m15Pullback?: boolean;
  m15PullbackType?: PullbackType;
  m15TriggerDirection?: TriggerDirection;
  m15PriceActionTrigger?: PriceActionTrigger;
  m15TriggerValid?: boolean;
  m15Screenshot?: string;

  // M5 Entry Confirmation
  m5Pullback?: boolean; // M5 Pullback confirmed? YES / NO
  m5EntryConfirmed?: boolean; // M5 Entry confirmed? YES / NO

  // Section: Trade Plan & Pricing
  direction: TradeDirection;
  entryPrice?: number | null;
  stopLoss?: number | null;
  takeProfit?: number | null;
  plannedRR?: number | null;

  // Section: Result & Execution Audit Fields
  result: TradeResultStatus;
  outcomeType?: TradeOutcomeType; // TP | SL | Breakeven | Manual Exit | No Trade
  actualExitPrice?: number | null;
  actualR?: number | null;
  accountBalance?: number | null;
  riskPercent?: number | null;
  realizedPnL?: number | null;
  tradingCostsR?: number | null; // commissions / spreads in R
  entryQuality?: EntryQuality; // A, B, C setup clarity
  mfe?: number | null; // Maximum Favorable Excursion in R
  nearestOpposingZone?: string | null;
  ruleFollowed?: boolean; // Followed rules without moving SL/TP mid-trade
  lossReason?: LossReason | null;

  // Missed Setup / No-Trade Log
  isMissedSetup?: boolean;
  skipReason?: string;
  hypotheticalOutcome?: string;

  // Section: News / Market Conditions
  highImpactNewsNearby?: HighImpactNewsOption;
  marketCondition?: MarketConditionOption;
  newsNotes?: string;

  // Section: Setup Validation Checklist
  checklistState?: Record<string, boolean>;

  // Section: Screenshots
  screenshots?: TradeScreenshots;

  // Section: Qualitative Notes
  notes: string;

  createdAt: string;
  updatedAt: string;
}

export type MSP1Setup = TradingSetup;
