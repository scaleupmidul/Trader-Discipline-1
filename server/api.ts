import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import type { User } from '../src/types/index.ts';

export const apiRouter = express.Router();

// Middleware to extract and verify auth token
export interface AuthRequest extends Request {
  user?: User;
}

const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const user = await db.getUserByToken(token);
    if (!user) {
      res.status(401).json({ error: 'Session expired or invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Authentication error' });
  }
};

// --- Health & Status ---

apiRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    ...db.getStatus(),
  });
});

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    ...db.getStatus(),
  });
});

// --- Auth Endpoints ---

apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }
    const result = await db.register(name, email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const result = await db.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid credentials.' });
  }
});

apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

apiRouter.put('/auth/password', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Both current and new passwords are required.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters.' });
      return;
    }
    await db.updatePassword(req.user!.id, currentPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update password.' });
  }
});

apiRouter.put('/auth/settings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, timezone } = req.body;
    const updated = await db.updateUserSettings(req.user!.id, name, timezone);
    res.json({ user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update settings.' });
  }
});

// --- Daily Practice Endpoints ---

apiRouter.get('/daily_practice', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const practice = await db.getDailyPractice(req.user!.id, date);
    res.json(practice);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get daily practice.' });
  }
});

apiRouter.get('/daily_practice/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const practices = await db.getAllDailyPractices(req.user!.id);
    res.json(practices);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch practices.' });
  }
});

apiRouter.post('/daily_practice', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const practice = await db.saveDailyPractice(req.user!.id, req.body);
    res.json(practice);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save practice.' });
  }
});

// --- Trades Endpoints ---

apiRouter.get('/trades', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const trades = await db.getTrades(req.user!.id);
    res.json(trades);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get trades.' });
  }
});

apiRouter.post('/trades', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const trade = await db.addTrade(req.user!.id, req.body);
    res.json(trade);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to record trade.' });
  }
});

apiRouter.delete('/trades/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await db.deleteTrade(req.user!.id, req.params.id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete trade.' });
  }
});

// --- Backtest Setup Endpoints (LSE & DRE) ---

apiRouter.get('/msp1_setups', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const setups = await db.getMSP1Setups(req.user!.id);
    res.json(setups);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get backtest setups.' });
  }
});

apiRouter.get('/msp1_setups/next_id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const nextId = await db.getNextMSP1SetupId(req.user!.id);
    res.json({ nextId });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get next setup ID.' });
  }
});

apiRouter.get('/msp1_setups/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const setup = await db.getMSP1SetupById(req.user!.id, req.params.id);
    if (!setup) {
      res.status(404).json({ error: 'Backtest setup not found.' });
      return;
    }
    res.json(setup);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get backtest setup.' });
  }
});

apiRouter.post('/msp1_setups', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const setup = await db.addMSP1Setup(req.user!.id, req.body);
    res.json(setup);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save backtest setup.' });
  }
});

apiRouter.put('/msp1_setups/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await db.updateMSP1Setup(req.user!.id, req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update backtest setup.' });
  }
});

apiRouter.delete('/msp1_setups/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await db.deleteMSP1Setup(req.user!.id, req.params.id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete backtest setup.' });
  }
});

apiRouter.get('/msp1_setups/export/json', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const allSetups = await db.getMSP1Setups(req.user!.id);
    const sorted = [...allSetups].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const partNum = req.query.part ? parseInt(req.query.part as string, 10) : null;
    const totalPartsNum = req.query.total_parts ? parseInt(req.query.total_parts as string, 10) : null;
    const includeScreenshots = req.query.include_screenshots !== 'false';

    let setupsToExport = sorted;
    let filename = 'Gold_Backtest.json';
    let partMetadata: any = undefined;

    if (partNum && totalPartsNum && totalPartsNum > 1 && partNum >= 1 && partNum <= totalPartsNum) {
      const baseChunkSize = Math.floor(sorted.length / totalPartsNum);
      let remainder = sorted.length % totalPartsNum;
      let startIdx = 0;

      for (let i = 1; i < partNum; i++) {
        startIdx += baseChunkSize + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
      }

      const chunkSize = baseChunkSize + (remainder > 0 ? 1 : 0);
      setupsToExport = sorted.slice(startIdx, startIdx + chunkSize);
      filename = `Gold_Backtest_Part_${partNum}_of_${totalPartsNum}.json`;
      partMetadata = {
        part_number: partNum,
        total_parts: totalPartsNum,
        setups_in_this_part: setupsToExport.length,
        total_setups_in_journal: sorted.length,
        first_setup_id: setupsToExport[0]?.setupId || '',
        last_setup_id: setupsToExport[setupsToExport.length - 1]?.setupId || '',
      };
    }

    const validTrades = setupsToExport.filter(
      (s) => s.direction !== 'NO TRADE' && ['Win', 'Loss', 'Breakeven'].includes(s.result)
    );
    const wins = validTrades.filter((s) => s.result === 'Win');
    const losses = validTrades.filter((s) => s.result === 'Loss');
    const breakevens = validTrades.filter((s) => s.result === 'Breakeven');
    const noTrades = setupsToExport.filter(
      (s) => s.direction === 'NO TRADE' || ['No Trade', 'Incomplete Setup', 'Invalid Setup'].includes(s.result)
    );
    const decisiveTradesCount = wins.length + losses.length;
    const winRate = decisiveTradesCount > 0 ? (wins.length / decisiveTradesCount) * 100 : null;
    const totalR = setupsToExport.reduce((acc, s) => acc + (s.actualR || 0), 0);
    const expectancy = validTrades.length > 0 ? totalR / validTrades.length : null;

    const healthyPbTrades = setupsToExport.filter(
      (s) => (s.m15PullbackType === 'Healthy pullback') || (!s.m15PullbackType && s.m15Pullback === true)
    );
    const weakPbTrades = setupsToExport.filter((s) => s.m15PullbackType === 'Weak pullback');
    const noPbTrades = setupsToExport.filter(
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
    const liquidityEvents = setupsToExport.filter(
      (s) => s.liquidityLevelTaken === true || (s.liquidityLevelTaken === undefined && s.liquidityOutcome)
    );
    const sweepEvents = liquidityEvents.filter(
      (s) => s.liquidityOutcome === 'Sweep + Reversal' || (!s.liquidityOutcome && s.liquidityLevelTaken)
    );
    const bosEvents = liquidityEvents.filter(
      (s) => s.liquidityOutcome === 'Break + Continuation (BOS)'
    );
    const unclearEvents = liquidityEvents.filter(
      (s) => s.liquidityOutcome === 'Unclear'
    );

    const sweepWithMss = sweepEvents.filter((s) => s.liquidityOppositeMss !== false).length;
    const sweepToMssSuccessRate =
      sweepEvents.length > 0 ? (sweepWithMss / sweepEvents.length) * 100 : null;

    const sweepWithDisplacement = sweepEvents.filter((s) => s.liquidityDisplacement !== false).length;
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

    const exportData = {
      system: 'LSE & DRE Backtesting System',
      framework: 'H1 Structure & Key Zone → M15 Liquidity Sweep (LSE) / Demand Reaction (DRE) → M5 Refined Execution',
      system_edition: 'Gold LSE & DRE V2',
      asset_market: 'Gold (XAU/USD)',
      version: '2.0',
      exported_at: new Date().toISOString(),
      chatgpt_system_prompt:
        'You are an expert quantitative trading auditor and technical price action analyst. Analyze the following systematic backtest trades on Gold (XAU/USD) comparing two execution models: Model A: LSE (Liquidity Sweep Entry) and Model B: DRE (Demand Reaction Entry). Each trade is structured with H1 market structure and key levels (Demand/Supply), M15 Liquidity Event classification (Sweep + Reversal with reclaim, opposite MSS, and displacement vs Direct Demand Reaction), M5 pullback and execution trigger, risk parameters, realized R results, and chart screenshots. Crucial Rule to verify: "Level Break ≠ Liquidity Sweep". Evaluate the performance differential between LSE and DRE, whether sweeps outperform direct zone reactions, win rate, expectancy, and discipline adherence.',
      system_rules_summary: {
        model_a_lse: 'Liquidity Sweep Entry: Sweeps key high/low, immediate rejection & reclaim, opposite MSS, strong displacement, M5 pullback entry.',
        model_b_dre: 'Demand Reaction Entry: Direct mitigation into H1 unmitigated demand/supply, confirmed reaction, M15 confirmation / FVG, M5 entry.',
        level_break_vs_sweep_rule: 'LEVEL BREAK ≠ LIQUIDITY SWEEP. Price continuing in breakout direction without reclaim is BOS continuation (not a sweep reversal).',
        risk_management: 'Strict risk control with minimum 1:2.0 Planned R:R. Never widen stop loss mid-trade.'
      },
      dataset_overview: {
        total_setups_recorded: setupsToExport.length,
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
      ...(partMetadata ? { part_metadata: partMetadata } : {}),
      setups: setupsToExport.map((s) => {
        const beforeEntryImg = s.screenshots?.beforeEntry || '';
        const entryImg = s.screenshots?.entry || '';
        const afterTradeImg = s.screenshots?.afterTrade || '';
        const h1Img = s.h1Screenshot || s.screenshots?.h1 || beforeEntryImg || '';
        const m15Img = s.m15Screenshot || s.screenshots?.m15 || entryImg || '';
        const otherImgs = s.screenshots?.other || [];
        const pullbackType = s.m15PullbackType || (s.m15Pullback ? 'Healthy pullback' : 'No pullback');
        const liquidityStatus = s.liquidityOutcome || (s.liquidityLevelTaken !== false ? 'Sweep + Reversal' : 'No Level Taken');

        const summaryLine = `${s.setupId} | ${s.date} (${s.session}) | ${s.direction} ${s.market || 'XAU/USD'} | Model: ${s.strategy || 'LSE'} | H1: ${s.h1Bias || 'Unclear'} (${s.h1StructureType || 'HH + HL'}) | Level: ${s.importantLevel || 'Demand'} (${s.levelQuality || 'Strong'}) | 1H: ${s.h1MssDirection || (s.direction === 'BUY' ? 'Bullish MSS' : 'Bearish MSS')} (1H Close: ${s.h1CandleCloseConfirmed ? 'YES' : 'NO'}) | Liquidity: ${liquidityStatus} (${s.liquidityWhatTaken || (s.direction === 'SELL' ? 'Prev High' : 'Prev Low')}) | 15M: ${pullbackType} + ${s.m15PriceActionTrigger || 'Clean Confirmation'} (Valid: ${s.m15TriggerValid ? 'YES' : 'NO'}) | Entry: ${s.entryPrice ?? 'N/A'}, SL: ${s.stopLoss ?? 'N/A'}, TP: ${s.takeProfit ?? 'N/A'} (RR: ${s.plannedRR ? `1:${s.plannedRR.toFixed(2)}` : 'N/A'}) | Result: ${s.result} (${s.actualR != null ? `${s.actualR > 0 ? '+' : ''}${s.actualR}R` : '0R'}) | Rules Kept: ${s.ruleFollowed ? 'YES' : 'NO'} | Loss Reason: ${s.result === 'Loss' ? (s.lossReason || 'Normal loss') : 'N/A'}`;

        return {
          setup_id: s.setupId,
          date: s.date,
          market: s.market || 'XAU/USD',
          strategy: s.strategy || 'LSE',
          session: s.session,
          timeframe_range: s.timeframeRange || '',
          direction: s.direction,

          // One-line dense summary for ChatGPT instant comprehension
          chatgpt_one_line_summary: summaryLine,

          // Tier 1: H1 Structure & Key Level
          tier_1_h1_context: {
            bias: s.h1Bias || 'Unclear',
            structure: s.h1StructureType || 'HH + HL',
            key_level: s.importantLevel || 'Demand',
            level_quality: s.levelQuality || 'Strong',
            has_chart_attached: Boolean(h1Img),
          },

          // Tier 2: 1H Confirmation
          tier_2_1h_confirmation: {
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

          // Execution Outcome & Audit
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

          // All Attached Chart Screenshots
          chart_screenshots: includeScreenshots
            ? {
                before_entry_image: beforeEntryImg || null,
                entry_image: entryImg || null,
                after_trade_image: afterTradeImg || null,
                total_images_attached: [beforeEntryImg, entryImg, afterTradeImg].filter(Boolean).length,
                has_chart_images: Boolean(beforeEntryImg || entryImg || afterTradeImg),
              }
            : {
                has_chart_images: Boolean(beforeEntryImg || entryImg || afterTradeImg),
                omitted_for_fast_ai_mode: true,
                note: 'Chart screenshots omitted for lightweight JSON export. To include, set include_screenshots=true.',
              },

          // Clean Structured Fields
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

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to export Backtest JSON.' });
  }
});

apiRouter.get('/msp1_setups/export/csv', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const setups = await db.getMSP1Setups(req.user!.id);
    const headers = [
      'Setup ID',
      'Date',
      'Market',
      'Strategy',
      'Session',
      'H1 Bias',
      'H1 Structure',
      'Key Level',
      'Level Quality',
      '1H Prev Structure',
      '1H MSS',
      '1H Last Swing',
      '1H Break',
      '1H Candle Close Confirmed',
      'Liquidity Event',
      '15M Pullback',
      '15M Trigger Direction',
      '15M Trigger Type',
      '15M Trigger Valid',
      'Trade Direction',
      'Entry Price',
      'Stop Loss',
      'Take Profit',
      'Planned RR',
      'Result',
      'Actual Exit Price',
      'Actual R',
      'Entry Quality',
      'MFE (R)',
      'Nearest Opposing Zone',
      'Rule Followed',
      'Loss Reason',
      'High Impact News Nearby',
      'Market Condition',
      'Is Missed Setup',
      'Skip Reason',
      'Hypothetical Outcome',
      'Notes',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = setups.map((s) => [
      escapeCsv(s.setupId),
      escapeCsv(s.date),
      escapeCsv(s.market),
      escapeCsv(s.strategy || (s.liquidityOutcome === 'Sweep + Reversal' ? 'LSE' : 'DRE')),
      escapeCsv(s.session),
      escapeCsv(s.h1Bias || 'Unclear'),
      escapeCsv(s.h1StructureType || 'HH + HL'),
      escapeCsv(s.importantLevel || 'Demand'),
      escapeCsv(s.levelQuality || 'Strong'),
      escapeCsv(s.h1PrevStructure),
      escapeCsv(s.h1MssDirection),
      escapeCsv(s.h1LastSwing),
      escapeCsv(s.h1StructureBreak),
      escapeCsv(s.h1CandleCloseConfirmed ? 'Yes' : 'No'),
      escapeCsv(s.liquidityOutcome || (s.liquidityLevelTaken ? 'Sweep + Reversal' : 'None')),
      escapeCsv(s.m15PullbackType || (s.m15Pullback ? 'Healthy pullback' : 'No pullback')),
      escapeCsv(s.m15TriggerDirection),
      escapeCsv(s.m15PriceActionTrigger),
      escapeCsv(s.m15TriggerValid ? 'Yes' : 'No'),
      escapeCsv(s.direction),
      escapeCsv(s.entryPrice ?? ''),
      escapeCsv(s.stopLoss ?? ''),
      escapeCsv(s.takeProfit ?? ''),
      escapeCsv(s.plannedRR != null ? `1:${s.plannedRR.toFixed(2)}` : ''),
      escapeCsv(s.result),
      escapeCsv(s.actualExitPrice ?? ''),
      escapeCsv(s.actualR != null ? s.actualR.toFixed(2) : ''),
      escapeCsv(s.entryQuality || 'A'),
      escapeCsv(s.mfe != null ? `+${s.mfe}R` : ''),
      escapeCsv(s.nearestOpposingZone || 'None before 2R'),
      escapeCsv((s.ruleFollowed ?? true) ? 'Yes' : 'No'),
      escapeCsv(s.result === 'Loss' ? (s.lossReason || 'Normal loss') : ''),
      escapeCsv(s.highImpactNewsNearby),
      escapeCsv(s.marketCondition),
      escapeCsv(s.isMissedSetup ? 'Yes' : 'No'),
      escapeCsv(s.skipReason || ''),
      escapeCsv(s.hypotheticalOutcome || ''),
      escapeCsv(s.notes),
    ]);

    const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Gold_Backtest.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to export Backtest CSV.' });
  }
});

// --- Mistakes Endpoints ---

apiRouter.get('/mistakes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const mistakes = await db.getMistakes(req.user!.id);
    res.json(mistakes);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get mistakes.' });
  }
});

apiRouter.post('/mistakes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const mistake = await db.addMistake(req.user!.id, req.body);
    res.json(mistake);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to record mistake.' });
  }
});

apiRouter.delete('/mistakes/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await db.deleteMistake(req.user!.id, req.params.id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete mistake.' });
  }
});

// --- Psychology Endpoints ---

apiRouter.get('/psychology', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await db.getPsychologyLogs(req.user!.id);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get psychology logs.' });
  }
});

apiRouter.post('/psychology', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const log = await db.addPsychologyLog(req.user!.id, req.body);
    res.json(log);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to record psychology entry.' });
  }
});

// --- Reviews Endpoints ---

apiRouter.get('/reviews/daily', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const review = await db.getDailyReview(req.user!.id, date);
    res.json(review);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get daily review.' });
  }
});

apiRouter.post('/reviews/daily', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const review = await db.saveDailyReview(req.user!.id, req.body);
    res.json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save daily review.' });
  }
});

apiRouter.get('/reviews/weekly', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const weekStartDate = req.query.weekStartDate as string;
    if (!weekStartDate) {
      res.status(400).json({ error: 'weekStartDate is required.' });
      return;
    }
    const review = await db.getWeeklyReview(req.user!.id, weekStartDate);
    res.json(review);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get weekly review.' });
  }
});

apiRouter.post('/reviews/weekly', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const review = await db.saveWeeklyReview(req.user!.id, req.body);
    res.json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save weekly review.' });
  }
});

apiRouter.get('/reviews/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await db.getAllReviews(req.user!.id);
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get all reviews.' });
  }
});

// --- Skills Endpoints ---

apiRouter.get('/skills', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const skills = await db.getSkills(req.user!.id);
    res.json(skills);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get skills.' });
  }
});

apiRouter.post('/skills/practice', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { skillId, notes } = req.body;
    const skill = await db.logSkillPractice(req.user!.id, skillId, notes);
    res.json(skill);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update skill practice.' });
  }
});

apiRouter.put('/skills/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { notes } = req.body;
    const skill = await db.updateSkillNotes(req.user!.id, req.params.id, notes);
    res.json(skill);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update skill notes.' });
  }
});

// --- Export & Clear ---

apiRouter.get('/export', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await db.exportUserData(req.user!.id);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to export data.' });
  }
});

apiRouter.post('/clear_data', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await db.clearUserData(req.user!.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear data.' });
  }
});
