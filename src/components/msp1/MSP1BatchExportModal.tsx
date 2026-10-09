import React, { useState, useMemo } from 'react';
import type { MSP1Setup } from '../../types/index.ts';
import {
  X,
  Download,
  Copy,
  Check,
  Bot,
  ImageIcon,
  Zap,
} from 'lucide-react';

interface MSP1BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  setups: MSP1Setup[];
}

type SplitMode = 'PARTS' | 'BATCH_SIZE';

export const MSP1BatchExportModal: React.FC<MSP1BatchExportModalProps> = ({
  isOpen,
  onClose,
  setups,
}) => {
  const [splitMode, setSplitMode] = useState<SplitMode>('PARTS');
  const [numParts, setNumParts] = useState<number>(3);
  const [batchSize, setBatchSize] = useState<number>(100);
  const [copiedPart, setCopiedPart] = useState<number | null>(null);
  const [downloadingPart, setDownloadingPart] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState<boolean>(false);
  const [includeScreenshots, setIncludeScreenshots] = useState<boolean>(true);

  // Chronologically sorted setups
  const sortedSetups = useMemo(() => {
    return [...setups].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [setups]);

  const totalSetups = sortedSetups.length;

  // Calculate chunks / parts
  const parts = useMemo(() => {
    if (totalSetups === 0) return [];

    let actualPartsCount = 1;
    if (splitMode === 'PARTS') {
      actualPartsCount = Math.max(1, Math.min(numParts, totalSetups));
    } else {
      actualPartsCount = Math.max(1, Math.ceil(totalSetups / Math.max(1, batchSize)));
    }

    const chunks: {
      partNumber: number;
      totalParts: number;
      setups: MSP1Setup[];
      startIdx: number;
      endIdx: number;
      firstSetupId: string;
      lastSetupId: string;
      validTrades: number;
      wins: number;
      losses: number;
      netR: number;
    }[] = [];

    const baseChunkSize = Math.floor(totalSetups / actualPartsCount);
    let remainder = totalSetups % actualPartsCount;
    let currentIdx = 0;

    for (let i = 0; i < actualPartsCount; i++) {
      const chunkSize = baseChunkSize + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      const chunkSetups = sortedSetups.slice(currentIdx, currentIdx + chunkSize);
      if (chunkSetups.length === 0) break;

      const valid = chunkSetups.filter(
        (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
      );
      const wins = valid.filter((s) => s.result === 'Win').length;
      const losses = valid.filter((s) => s.result === 'Loss').length;
      const netR = valid.reduce((acc, s) => acc + (s.actualR || 0), 0);

      chunks.push({
        partNumber: i + 1,
        totalParts: actualPartsCount,
        setups: chunkSetups,
        startIdx: currentIdx + 1,
        endIdx: currentIdx + chunkSetups.length,
        firstSetupId: chunkSetups[0]?.setupId || `#${currentIdx + 1}`,
        lastSetupId:
          chunkSetups[chunkSetups.length - 1]?.setupId ||
          `#${currentIdx + chunkSetups.length}`,
        validTrades: valid.length,
        wins,
        losses,
        netR: Number(netR.toFixed(2)),
      });

      currentIdx += chunkSize;
    }

    return chunks;
  }, [sortedSetups, totalSetups, splitMode, numParts, batchSize]);

  if (!isOpen) return null;

  const getPartPrompt = (part: (typeof parts)[0]) => {
    if (part.totalParts === 1) {
      return `Hello ChatGPT! This is my complete Gold (XAU/USD) Systematic Trade Journal (${part.firstSetupId} to ${part.lastSetupId}, ${part.setups.length} setups with chart screenshots).

Comparative Strategies:
- Model A: LSE (Liquidity Sweep Entry) — Sweeps key high/low, immediate rejection & reclaim, opposite MSS, strong displacement, M5 pullback entry.
- Model B: DRE (Demand Reaction Entry) — Direct reaction at unmitigated H1 demand/supply zone, confirmed defense, M5 pullback entry.
- Core Rule: Level Break ≠ Liquidity Sweep. A continuation break without reclaim is BOS (Break of Structure), NOT a sweep reversal.

Each setup includes the Core Journal Parameters and chart screenshots:
1. Strategy (LSE or DRE)
2. H1 Bias (Bullish / Bearish / Unclear) & H1 Structure (HH + HL / LH + LL)
3. Key Level (Demand / Supply / Support / Resistance) & Quality (Strong fresh zone vs tested)
4. M15 Confirmation:
   - For LSE: Liquidity Sweep of previous High/Low + Level Reclaimed + Opposite MSS + Impulsive Displacement
   - For DRE: Unmitigated Zone Defense + Reaction + Structural Shift / FVG
5. M5 Pullback (Healthy pullback / Weak pullback / No pullback)
6. M5 Trigger (Clean price action trigger: rejection, engulfing, pinbar)
7. Entry Price, Stop Loss (structural), Take Profit
8. Planned RR (Minimum 1:2.0 Planned Risk:Reward)
9. Result (Win / Loss / Breakeven / No Trade) & Realized R (+2R, -1R, 0R)
10. Rule Followed? (Maintained trade rules vs. early intervention)
11. Loss Reason (Wrong H1 bias, Wrong key level, False MSS, Weak pullback, False trigger, Opposing zone, SL too tight, Normal loss, Other)

Please audit:
1. Comparative edge: Compare LSE vs DRE performance (win rate, expectancy in R, profit factor). Which model yields superior risk-adjusted return?
2. Liquidity Filter validation: Evaluate whether setups requiring true Liquidity Sweep (Reclaim + MSS + Displacement) outperform simple level breaks, and how the "Level Break ≠ Liquidity Sweep" filter prevented false reversals.
3. 15M Pullback edge: Compare performance of trades entered on "Healthy pullback" vs "Weak pullback".
4. Strategy breakdown: For losing trades, examine the "Loss Reason" categories. Are losses normal market variance, or due to wrong H1 bias, false MSS, weak pullbacks, or discipline violations?
5. Visual Chart Screenshots: Inspect the attached screenshots under \`chart_screenshots\` (H1, 15M, Before Entry, Entry, After Trade) for execution precision.`;
    }

    return `Hello ChatGPT! This is Part ${part.partNumber} of ${part.totalParts} of my Gold (XAU/USD) Trade Journal (${part.firstSetupId} to ${part.lastSetupId}, ${part.setups.length} setups).

Comparative Strategies:
- Model A: LSE (Liquidity Sweep Entry) — Sweep of key level, reclaim, opposite MSS, displacement.
- Model B: DRE (Demand Reaction Entry) — Direct unmitigated H1 demand/supply reaction.
- Core Rule: Level Break ≠ Liquidity Sweep.

Each setup includes:
1. Strategy (LSE vs DRE), Session, and Direction
2. H1 Market Structure (Bias, Structure, Key Level & Quality)
3. M15 Confirmation (Sweep + Reclaim + MSS + Displacement for LSE vs Direct Demand Reaction for DRE)
4. M5 Refined Pullback & Trigger
5. Entry, SL, TP, Planned RR (min 1:2.0), Realized R, and Audit
6. Loss Reason (Wrong H1 bias, Wrong key level, False MSS, Weak pullback, False trigger, Opposing zone, SL too tight, Normal loss, Other)

Please audit:
1. Comparative statistical breakdown: LSE vs DRE win rate, expectancy, and rule adherence rate.
2. Sweep vs Break filter analysis: Level Break ≠ Liquidity Sweep rule adherence.
3. Pullback edge: Performance of healthy pullbacks vs weak pullbacks.
4. Loss breakdown and discipline audit.
5. Visual Chart Analysis: Each setup includes attached chart screenshots under \`chart_screenshots\` (H1, 15M, Before Entry, Entry, After Trade).
${
  part.partNumber < part.totalParts
    ? `6. Store this part's data in context. I will upload Part ${part.partNumber + 1} next. Wait for all ${part.totalParts} parts before providing the complete system verdict.`
    : `6. This is the final part (${part.totalParts} of ${part.totalParts}). Please analyze all accumulated parts to deliver a comprehensive statistical edge review of the LSE and DRE comparative framework.`
}`;
  };

  const generatePartJSON = (part: (typeof parts)[0]) => {
    const promptText = getPartPrompt(part);

    const validTrades = part.setups.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const wins = validTrades.filter((s) => s.result === 'Win');
    const losses = validTrades.filter((s) => s.result === 'Loss');
    const breakevens = validTrades.filter((s) => s.result === 'Breakeven');
    const noTrades = part.setups.filter(
      (s) => s.direction === 'NO TRADE' || ['No Trade', 'Incomplete Setup', 'Invalid Setup'].includes(s.result)
    );
    const decisiveTradesCount = wins.length + losses.length;
    const winRate = decisiveTradesCount > 0 ? (wins.length / decisiveTradesCount) * 100 : null;
    const totalR = part.setups.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const expectancy = validTrades.length > 0 ? totalR / validTrades.length : null;

    const healthyPbTrades = part.setups.filter(
      (s) => (s.m15PullbackType === 'Healthy pullback') || (!s.m15PullbackType && s.m15Pullback === true)
    );
    const weakPbTrades = part.setups.filter((s) => s.m15PullbackType === 'Weak pullback');
    const noPbTrades = part.setups.filter(
      (s) => s.m15PullbackType === 'No pullback' || (!s.m15PullbackType && s.m15Pullback === false)
    );

    const healthyValid = healthyPbTrades.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const healthyWins = healthyValid.filter((s) => s.result === 'Win');
    const healthyLosses = healthyValid.filter((s) => s.result === 'Loss');
    const healthyDecisive = healthyWins.length + healthyLosses.length;
    const healthyWinRate = healthyDecisive > 0 ? (healthyWins.length / healthyDecisive) * 100 : null;
    const healthyTotalR = healthyPbTrades.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const healthyExp = healthyValid.length > 0 ? healthyTotalR / healthyValid.length : null;

    const weakValid = weakPbTrades.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const weakWins = weakValid.filter((s) => s.result === 'Win');
    const weakLosses = weakValid.filter((s) => s.result === 'Loss');
    const weakDecisive = weakWins.length + weakLosses.length;
    const weakWinRate = weakDecisive > 0 ? (weakWins.length / weakDecisive) * 100 : null;
    const weakTotalR = weakPbTrades.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const weakExp = weakValid.length > 0 ? weakTotalR / weakValid.length : null;

    // Dedicated Liquidity Event Analysis (H1 SHARP V2 Validation: Level Break ≠ Liquidity Sweep)
    const liquidityEvents = part.setups.filter(
      (s) => Boolean(s.liquidityLevelTaken) || Boolean(s.liquidityOutcome || s.liquidityEventOutcome)
    );
    const sweepEvents = liquidityEvents.filter(
      (s) => (s.liquidityEventOutcome || s.liquidityOutcome) === 'Sweep + Reversal' || (!s.liquidityEventOutcome && !s.liquidityOutcome && Boolean(s.liquidityLevelTaken))
    );
    const bosEvents = liquidityEvents.filter(
      (s) => (s.liquidityEventOutcome || s.liquidityOutcome) === 'Break + Continuation (BOS)'
    );
    const unclearEvents = liquidityEvents.filter(
      (s) => (s.liquidityEventOutcome || s.liquidityOutcome) === 'Unclear'
    );

    const sweepWithMss = sweepEvents.filter((s) => s.liquidityOppositeMss !== false && s.sweepOppositeMss !== false).length;
    const sweepToMssSuccessRate =
      sweepEvents.length > 0 ? (sweepWithMss / sweepEvents.length) * 100 : null;

    const sweepWithDisplacement = sweepEvents.filter((s) => s.liquidityDisplacement !== false && s.sweepStrongDisplacement !== false).length;
    const sweepToDisplacementSuccessRate =
      sweepEvents.length > 0 ? (sweepWithDisplacement / sweepEvents.length) * 100 : null;

    const sweepValid = sweepEvents.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const sweepWins = sweepValid.filter((s) => s.result === 'Win');
    const sweepLosses = sweepValid.filter((s) => s.result === 'Loss');
    const sweepDecisive = sweepWins.length + sweepLosses.length;
    const sweepWinRate = sweepDecisive > 0 ? (sweepWins.length / sweepDecisive) * 100 : null;
    const sweepTotalR = sweepValid.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const sweepExp = sweepValid.length > 0 ? sweepTotalR / sweepValid.length : null;

    const bosValid = bosEvents.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const bosWins = bosValid.filter((s) => s.result === 'Win');
    const bosLosses = bosValid.filter((s) => s.result === 'Loss');
    const bosDecisive = bosWins.length + bosLosses.length;
    const bosWinRate = bosDecisive > 0 ? (bosWins.length / bosDecisive) * 100 : null;
    const bosTotalR = bosValid.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const bosExp = bosValid.length > 0 ? bosTotalR / bosValid.length : null;

    const rejectedDueToBOS = bosEvents.filter(
      (s) =>
        s.result === 'No Trade' ||
        s.result === 'Invalid Setup' ||
        s.direction === 'NO TRADE' ||
        s.bosPriceContinued === true
    ).length;

    const totalImagesCount = part.setups.reduce((acc, s) => {
      const imgs = [
        s.screenshots?.beforeEntry,
        s.screenshots?.entry,
        s.screenshots?.afterTrade,
        s.screenshots?.h1 || s.h1Screenshot,
        s.screenshots?.m15 || s.m15Screenshot,
        ...(s.screenshots?.other || []),
      ].filter(Boolean);
      return acc + imgs.length;
    }, 0);

    return {
      system: 'LSE & DRE Backtesting System',
      framework: 'H1 Structure & Key Zone → M15 Liquidity Sweep (LSE) / Demand Reaction (DRE) → M5 Refined Execution',
      asset_market: 'Gold (XAU/USD)',
      version: '2.0',
      part_metadata: {
        part_number: part.partNumber,
        total_parts: part.totalParts,
        is_complete_single_file: part.totalParts === 1,
        setups_in_this_part: part.setups.length,
        total_setups_in_journal: totalSetups,
        id_range: `${part.firstSetupId} - ${part.lastSetupId}`,
        total_chart_screenshots_in_part: totalImagesCount,
        exported_at: new Date().toISOString(),
      },
      chatgpt_system_prompt: promptText,
      system_rules_summary: {
        model_a_lse: 'Liquidity Sweep Entry: Sweeps key high/low, immediate rejection & reclaim, opposite MSS, strong displacement, M5 pullback entry.',
        model_b_dre: 'Demand Reaction Entry: Direct mitigation into H1 unmitigated demand/supply, confirmed reaction, M15 confirmation / FVG, M5 entry.',
        level_break_vs_sweep_rule: 'LEVEL BREAK ≠ LIQUIDITY SWEEP. Price continuing in breakout direction without reclaim is BOS continuation (not a sweep reversal).',
        risk_management: 'Strict risk control with minimum 1:2.0 Planned R:R. Never widen stop loss mid-trade.'
      },
      part_statistics: {
        total_situations: part.setups.length,
        executed_trades_count: validTrades.length,
        wins_count: wins.length,
        losses_count: losses.length,
        breakevens_count: breakevens.length,
        no_trades_count: noTrades.length,
        win_rate_percentage: winRate !== null ? Number(winRate.toFixed(1)) : null,
        win_rate_display: winRate !== null ? `${winRate.toFixed(1)}%` : 'N/A',
        total_net_r: Number(totalR.toFixed(2)),
        total_net_r_display: `${totalR > 0 ? '+' : ''}${totalR.toFixed(2)} R`,
        expectancy_r_per_trade: expectancy !== null ? Number(expectancy.toFixed(2)) : null,
        expectancy_display: expectancy !== null ? `${expectancy > 0 ? '+' : ''}${expectancy.toFixed(2)} R` : 'N/A',
        total_screenshots_attached: totalImagesCount,
        liquidity_event_analysis: {
          total_liquidity_events: liquidityEvents.length,
          sweep_plus_reversal: {
            count: sweepEvents.length,
            percentage_of_events: liquidityEvents.length > 0 ? Number(((sweepEvents.length / liquidityEvents.length) * 100).toFixed(1)) : 0,
            sweep_to_mss_success_rate: sweepToMssSuccessRate !== null ? Number(sweepToMssSuccessRate.toFixed(1)) : null,
            sweep_to_mss_display: sweepToMssSuccessRate !== null ? `${sweepToMssSuccessRate.toFixed(1)}%` : 'N/A',
            sweep_to_displacement_success_rate: sweepToDisplacementSuccessRate !== null ? Number(sweepToDisplacementSuccessRate.toFixed(1)) : null,
            sweep_to_displacement_display: sweepToDisplacementSuccessRate !== null ? `${sweepToDisplacementSuccessRate.toFixed(1)}%` : 'N/A',
            valid_trades: sweepValid.length,
            wins: sweepWins.length,
            losses: sweepLosses.length,
            win_rate_percentage: sweepWinRate !== null ? Number(sweepWinRate.toFixed(1)) : null,
            win_rate_display: sweepWinRate !== null ? `${sweepWinRate.toFixed(1)}%` : 'N/A',
            net_r: Number(sweepTotalR.toFixed(2)),
            net_r_display: `${sweepTotalR > 0 ? '+' : ''}${sweepTotalR.toFixed(2)} R`,
            expectancy_r_per_trade: sweepExp !== null ? Number(sweepExp.toFixed(2)) : null,
            expectancy_display: sweepExp !== null ? `${sweepExp > 0 ? '+' : ''}${sweepExp.toFixed(2)} R` : 'N/A',
          },
          break_plus_continuation_bos: {
            count: bosEvents.length,
            percentage_of_events: liquidityEvents.length > 0 ? Number(((bosEvents.length / liquidityEvents.length) * 100).toFixed(1)) : 0,
            valid_trades: bosValid.length,
            wins: bosWins.length,
            losses: bosLosses.length,
            win_rate_percentage: bosWinRate !== null ? Number(bosWinRate.toFixed(1)) : null,
            win_rate_display: bosWinRate !== null ? `${bosWinRate.toFixed(1)}%` : 'Filtered (0 Trades)',
            net_r: Number(bosTotalR.toFixed(2)),
            net_r_display: `${bosTotalR > 0 ? '+' : ''}${bosTotalR.toFixed(2)} R`,
            expectancy_r_per_trade: bosExp !== null ? Number(bosExp.toFixed(2)) : null,
            expectancy_display: bosExp !== null ? `${bosExp > 0 ? '+' : ''}${bosExp.toFixed(2)} R` : 'N/A',
            potential_setups_rejected_due_to_bos_continuation: rejectedDueToBOS,
          },
          unclear_events: {
            count: unclearEvents.length,
            percentage_of_events: liquidityEvents.length > 0 ? Number(((unclearEvents.length / liquidityEvents.length) * 100).toFixed(1)) : 0,
          },
          core_validation_rule: 'Level Break ≠ Liquidity Sweep. Price breaking a level and continuing strongly is BOS / Continuation, rejecting a reversal trade. Valid reversal setups require Reclaim + MSS + Displacement.'
        },
        pullback_analysis: {
          healthy_pullbacks: {
            total_situations: healthyPbTrades.length,
            valid_trades: healthyValid.length,
            wins: healthyWins.length,
            losses: healthyLosses.length,
            win_rate_percentage: healthyWinRate !== null ? Number(healthyWinRate.toFixed(1)) : null,
            win_rate_display: healthyWinRate !== null ? `${healthyWinRate.toFixed(1)}%` : 'N/A',
            net_r: Number(healthyTotalR.toFixed(2)),
            net_r_display: `${healthyTotalR > 0 ? '+' : ''}${healthyTotalR.toFixed(2)} R`,
            expectancy_r_per_trade: healthyExp !== null ? Number(healthyExp.toFixed(2)) : null,
            expectancy_display: healthyExp !== null ? `${healthyExp > 0 ? '+' : ''}${healthyExp.toFixed(2)} R` : 'N/A',
          },
          weak_pullbacks: {
            total_situations: weakPbTrades.length,
            valid_trades: weakValid.length,
            wins: weakWins.length,
            losses: weakLosses.length,
            win_rate_percentage: weakWinRate !== null ? Number(weakWinRate.toFixed(1)) : null,
            win_rate_display: weakWinRate !== null ? `${weakWinRate.toFixed(1)}%` : 'N/A',
            net_r: Number(weakTotalR.toFixed(2)),
            net_r_display: `${weakTotalR > 0 ? '+' : ''}${weakTotalR.toFixed(2)} R`,
            expectancy_r_per_trade: weakExp !== null ? Number(weakExp.toFixed(2)) : null,
            expectancy_display: weakExp !== null ? `${weakExp > 0 ? '+' : ''}${weakExp.toFixed(2)} R` : 'N/A',
          },
          no_pullbacks: {
            total_situations: noPbTrades.length,
          },
        },
      },
      setups: part.setups.map((s) => {
        const beforeEntryImg = s.screenshots?.beforeEntry || '';
        const entryImg = s.screenshots?.entry || '';
        const afterTradeImg = s.screenshots?.afterTrade || '';
        const h1Img = s.h1Screenshot || s.screenshots?.h1 || beforeEntryImg || '';
        const m15Img = s.m15Screenshot || s.screenshots?.m15 || entryImg || '';
        const otherImgs = s.screenshots?.other || [];
        const pullbackType = s.m15PullbackType || (s.m15Pullback ? 'Healthy pullback' : 'No pullback');
        const liquidityStatus = s.liquidityEventOutcome || s.liquidityOutcome || (s.liquidityLevelTaken ? 'Sweep + Reversal' : 'No Level Taken');

        const summaryLine = `${s.setupId} | ${s.date} (${s.session}) | ${s.direction} ${s.market || 'XAU/USD'} | Model: ${s.strategy || 'LSE'} | H1: ${s.h1Bias || 'Unclear'} (${s.h1StructureType || 'HH + HL'}) | Level: ${s.importantLevel || 'Demand'} (${s.levelQuality || 'Strong'}) | Event: ${liquidityStatus} (${s.liquidityWhatTaken || (s.direction === 'SELL' ? 'Prev High' : 'Prev Low')}) | M15: ${pullbackType} + ${s.m15PriceActionTrigger || 'Clean Confirmation'} | Entry: ${s.entryPrice ?? 'N/A'}, SL: ${s.stopLoss ?? 'N/A'}, TP: ${s.takeProfit ?? 'N/A'} (RR: ${s.plannedRR ? `1:${s.plannedRR.toFixed(2)}` : 'N/A'}) | Result: ${s.result} (${s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : '0R'}) | Rules Kept: ${s.ruleFollowed ? 'YES' : 'NO'} | Loss Reason: ${s.result === 'Loss' ? (s.lossReason || 'Normal loss') : 'N/A'}`;

        return {
          setup_id: s.setupId,
          date: s.date,
          market: s.market || 'XAU/USD',
          strategy: s.strategy || 'LSE',
          session: s.session,
          timeframe_range: s.timeframeRange || '',
          direction: s.direction,

          // One-line summary for rapid ChatGPT absorption
          chatgpt_one_line_summary: summaryLine,

          // Tier 1: H1 Structure & Key Zone
          tier_1_h1_context: {
            bias: s.h1Bias || 'Unclear',
            structure: s.h1StructureType || 'HH + HL',
            key_level: s.importantLevel || 'Demand',
            level_quality: s.levelQuality || 'Strong',
            has_chart_attached: Boolean(h1Img),
          },

          // Tier 2: 1H / M15 Confirmation
          tier_2_confirmation: {
            previous_structure: s.h1PrevStructure,
            mss_direction: s.h1MssDirection,
            last_meaningful_swing: s.h1LastSwing,
            structure_break_level: s.h1StructureBreak,
            candle_close_confirmed: s.h1CandleCloseConfirmed,
            candle_close_status: s.h1CandleCloseConfirmed
              ? 'Confirmed: Completed 1H candle body closed beyond swing level'
              : 'Unconfirmed: Wick only or incomplete 1H candle',
            has_chart_attached: Boolean(h1Img),
          },

          // Step 4: Liquidity Event Evaluation (H1 SHARP V2 Validation: Level Break ≠ Liquidity Sweep)
          liquidity_event: {
            previous_high_low_taken: s.liquidityLevelTaken ?? true,
            what_was_taken: s.liquidityWhatTaken || (s.direction === 'SELL' ? 'Previous High' : 'Previous Low'),
            event_outcome: s.liquidityOutcome || 'Sweep + Reversal',
            sweep_details: (s.liquidityOutcome || 'Sweep + Reversal') === 'Sweep + Reversal' ? {
              liquidity_swept: s.liquiditySwept || (s.direction === 'SELL' ? 'High' : 'Low'),
              rejection_visible: s.liquidityRejection ?? true,
              price_reclaimed_level: s.liquidityReclaimed ?? true,
              opposite_mss_occurred: s.liquidityOppositeMss ?? true,
              strong_displacement_after_mss: s.liquidityDisplacement ?? true,
              validation_flow: s.direction === 'BUY'
                ? 'Previous Low → Sweep Below → Reclaim → Bullish MSS → Displacement'
                : 'Previous High → Sweep Above → Rejection/Reclaim → Bearish MSS → Displacement',
              is_valid_h1_sharp_v2_sweep: (s.liquidityRejection ?? true) && (s.liquidityReclaimed ?? true) && (s.liquidityOppositeMss ?? true) && (s.liquidityDisplacement ?? true),
            } : null,
            bos_details: s.liquidityOutcome === 'Break + Continuation (BOS)' ? {
              previous_level_broken: s.bosLevelBroken || s.liquidityWhatTaken || 'Key Level',
              bos_direction: s.bosDirection || (s.direction === 'SELL' ? 'Bearish' : 'Bullish'),
              price_continued_in_same_direction: s.bosPriceContinued ?? true,
              opposite_mss_occurred: s.bosOppositeMss ?? false,
              reversal_setup_status: 'Rejected: Event was BOS Continuation rather than Liquidity Sweep (Level Break ≠ Liquidity Sweep)',
            } : null,
          },

          // Step 5: 15M Entry Trigger
          step_5_15m_entry_trigger: {
            pullback_occurred: s.m15Pullback,
            pullback_type: pullbackType,
            trigger_direction: s.m15TriggerDirection,
            price_action_trigger: s.m15PriceActionTrigger,
            trigger_valid: s.m15TriggerValid,
            chart_image: m15Img || null,
          },

          // Trade Execution Plan
          trade_plan: {
            direction: s.direction,
            entry_price: s.entryPrice ?? null,
            stop_loss: s.stopLoss ?? null,
            take_profit: s.takeProfit ?? null,
            planned_rr: s.plannedRR ?? null,
            planned_rr_ratio: s.plannedRR ? `1:${s.plannedRR.toFixed(2)}` : null,
          },

          // Execution Outcome & Discipline Audit
          trade_result_and_audit: {
            result: s.result,
            actual_exit_price: s.actualExitPrice ?? null,
            actual_r: s.actualR ?? null,
            actual_r_display: s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : '0R',
            entry_quality: s.entryQuality || 'A',
            maximum_favorable_excursion_mfe: s.mfe != null ? `${s.mfe > 0 ? '+' : ''}${s.mfe}R` : (s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : 'N/A'),
            nearest_opposing_zone: s.nearestOpposingZone || 'None before 2R',
            rule_followed: s.ruleFollowed ?? true,
            loss_reason: s.result === 'Loss' ? (s.lossReason || 'Normal loss') : null,
          },

          // Market Context & News
          market_context: {
            high_impact_news_nearby: s.highImpactNewsNearby,
            market_condition: s.marketCondition,
            notes: s.newsNotes || '',
          },

          validation_checklist: s.checklistState || {},
          notes: s.notes || '',

          // Structured Chart Images & Timeframe Inventory
          images_summary: {
            has_images: Boolean(beforeEntryImg || entryImg || afterTradeImg || h1Img || m15Img),
            total_images_attached: [beforeEntryImg, entryImg, afterTradeImg].filter(Boolean).length,
            screenshots_included_in_json: includeScreenshots,
          },

          // Chart Screenshots
          chart_screenshots: includeScreenshots
            ? {
                before_entry: beforeEntryImg || null,
                entry: entryImg || null,
                after_trade: afterTradeImg || null,
                total_attached: [beforeEntryImg, entryImg, afterTradeImg].filter(Boolean).length,
              }
            : {
                has_chart_images: Boolean(beforeEntryImg || entryImg || afterTradeImg),
                omitted_for_fast_ai_mode: true,
                note: 'Chart images omitted in Fast AI mode for small JSON size. Toggle include screenshots on for image backup.',
              },

          // Structured Clean Fields
          h1_bias: s.h1Bias || 'Unclear',
          key_level: s.importantLevel || 'Demand',
          level_quality: s.levelQuality || 'Strong',
          one_h_mss: s.h1MssDirection,
          one_h_candle_closed: s.h1CandleCloseConfirmed,
          fifteen_m_pullback: pullbackType,
          fifteen_m_trigger: s.m15PriceActionTrigger,
          entry: s.entryPrice ?? null,
          sl: s.stopLoss ?? null,
          tp: s.takeProfit ?? null,
          rr: s.plannedRR ?? null,
          mfe: s.mfe != null ? `${s.mfe > 0 ? '+' : ''}${s.mfe}R` : (s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : 'N/A'),
          result: s.result,
          result_r: s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : '0R',
          core_trade_data: {
            'Strategy': s.strategy || 'LSE',
            'H1 Bias': s.h1Bias || 'Unclear',
            'Key Level': s.importantLevel || 'Demand',
            '1H MSS': `${s.h1MssDirection} (${s.h1CandleCloseConfirmed ? 'Candle Close Confirmed' : 'No Close'})`,
            '15M Pullback': pullbackType,
            '15M Trigger': s.m15PriceActionTrigger,
            'Entry': s.entryPrice ?? null,
            'SL': s.stopLoss ?? null,
            'TP': s.takeProfit ?? null,
            'RR': s.plannedRR ?? null,
            'Nearest Opposing Zone': s.nearestOpposingZone || 'None before 2R',
            'MFE': s.mfe != null ? `${s.mfe > 0 ? '+' : ''}${s.mfe}R` : (s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : 'N/A'),
            'Result': s.result,
            'Result in R': s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : '0R',
            'Rule Followed?': (s.ruleFollowed ?? true) ? 'Yes' : 'No',
            'Loss Reason': s.result === 'Loss' ? (s.lossReason || 'Normal loss') : 'N/A',
            'Entry Quality': s.entryQuality || 'A',
          },
          screenshots: includeScreenshots
            ? {
                beforeEntry: beforeEntryImg || '',
                entry: entryImg || '',
                afterTrade: afterTradeImg || '',
              }
            : {},
        };
      }),
    };
  };

  const handleDownloadPart = (part: (typeof parts)[0]) => {
    setDownloadingPart(part.partNumber);
    try {
      const data = generatePartJSON(part);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download =
        part.totalParts === 1
          ? `Gold_LSE_DRE_Journal_${today}.json`
          : `Gold_LSE_DRE_Part_${part.partNumber}_of_${part.totalParts}_${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download part error:', err);
    } finally {
      setTimeout(() => setDownloadingPart(null), 400);
    }
  };

  const handleDownloadAllSequential = async () => {
    setDownloadingAll(true);
    try {
      for (const part of parts) {
        handleDownloadPart(part);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleCopyPrompt = (part: (typeof parts)[0]) => {
    const prompt = getPartPrompt(part);
    navigator.clipboard.writeText(prompt);
    setCopiedPart(part.partNumber);
    setTimeout(() => setCopiedPart(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                Multi-Part Export for ChatGPT
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                Split {totalSetups} setups with images into sequential parts
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 pb-safe">
          {/* Split Selector */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Split Mode
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSplitMode('PARTS')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    splitMode === 'PARTS'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  By Parts
                </button>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => setSplitMode('BATCH_SIZE')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    splitMode === 'BATCH_SIZE'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  By Count
                </button>
              </div>
            </div>

            {splitMode === 'PARTS' ? (
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumParts(n)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      numParts === n
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {n === 1 ? '1 Full File' : `${n} Parts`}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {[25, 50, 100, 150].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setBatchSize(sz)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      batchSize === sz
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sz} / file
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Screenshot Mode Selector (Fast AI Mode vs Full Backup) */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className={`p-2 rounded-lg mt-0.5 ${
                includeScreenshots
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                {includeScreenshots ? <ImageIcon className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Include Chart Screenshots
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    includeScreenshots
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                  }`}>
                    {includeScreenshots ? 'Full Backup' : '⚡ Fast AI Mode'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {includeScreenshots
                    ? 'Includes sharp, compressed screenshots (~60KB/chart) for visual analysis.'
                    : 'Strips heavy base64 images (<50KB total JSON). Instant response in ChatGPT / Claude.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncludeScreenshots(!includeScreenshots)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                includeScreenshots ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
              title={includeScreenshots ? 'Disable screenshots for faster AI upload' : 'Enable screenshots for full backup'}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  includeScreenshots ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Download All Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Download Parts ({parts.length})
            </span>
            <button
              type="button"
              onClick={handleDownloadAllSequential}
              disabled={downloadingAll || parts.length === 0}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All ({parts.length})</span>
            </button>
          </div>

          {/* Parts List */}
          <div className="space-y-2">
            {parts.map((p) => {
              const isCopied = copiedPart === p.partNumber;
              const isDownloading = downloadingPart === p.partNumber;
              const imgCount = p.setups.reduce((acc, s) => {
                const imgs = [
                  s.screenshots?.beforeEntry,
                  s.screenshots?.entry,
                  s.screenshots?.afterTrade,
                  s.screenshots?.h1 || s.h1Screenshot,
                  s.screenshots?.m15 || s.m15Screenshot,
                  ...(s.screenshots?.other || []),
                ].filter(Boolean);
                return acc + imgs.length;
              }, 0);

              return (
                <div
                  key={p.partNumber}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                        {p.totalParts === 1 ? 'Complete Journal' : `Part ${p.partNumber} of ${p.totalParts}`}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        ({p.setups.length} setups · {p.firstSetupId} - {p.lastSetupId})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                      <span>{p.validTrades} trades</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{p.wins}W</span>
                      <span>·</span>
                      <span className="text-rose-600 dark:text-rose-400">{p.losses}L</span>
                      <span>·</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {p.netR > 0 ? '+' : ''}{p.netR}R
                      </span>
                      <span>·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        📷 {imgCount} images
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(p)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Copy ChatGPT prompt for this part"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadPart(p)}
                      disabled={isDownloading}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloading ? '...' : p.totalParts === 1 ? 'Download JSON' : `Part ${p.partNumber}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Upload Part 1, 2, 3 sequentially to ChatGPT with prompts.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
