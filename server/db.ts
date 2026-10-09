import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  User,
  DailyPractice,
  Trade,
  MistakeLog,
  PsychologyLog,
  DailyReview,
  WeeklyReview,
  SkillRecord,
  MSP1Setup,
} from '../src/types/index.ts';
import { CORE_SKILLS } from '../src/types/index.ts';
import { getMongoDb, getMongoStatus } from './mongodb.ts';

export interface UserRecord extends User {
  passwordHash: string;
  salt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  daily_practice: DailyPractice[];
  trades: Trade[];
  mistakes: MistakeLog[];
  psychology_logs: PsychologyLog[];
  daily_reviews: DailyReview[];
  weekly_reviews: WeeklyReview[];
  skills: SkillRecord[];
  msp1_setups: MSP1Setup[];
  sessions: { token: string; userId: string; createdAt: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'trader_discipline.json');

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const currentSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, currentSalt, 64).toString('hex');
  return { hash, salt: currentSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(hash, 'hex'));
}

function getInitialMSP1Setups(userId: string): MSP1Setup[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (Array.isArray(raw.msp1_setups) && raw.msp1_setups.length > 0) {
        return raw.msp1_setups.map((s: any) => ({
          ...s,
          userId,
        }));
      }
    }
  } catch (err) {
    console.error('Error loading initial backtest setups from JSON:', err);
  }
  return [];
}

class Database {
  private localData: DatabaseSchema;

  constructor() {
    this.localData = this.loadLocal();
    this.initLocalDemoAccount();
    // Warm up mongo connection in background
    getMongoDb()
      .then((mdb) => {
        if (mdb) {
          this.initMongoDemoAccount();
        }
      })
      .catch((err) => console.warn('[MongoDB Atlas] Background init warning:', err));
  }

  // --- Local Fallback Engine ---

  private loadLocal(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8').trim();
        if (raw && raw.startsWith('{')) {
          const parsed = JSON.parse(raw);
          return {
            users: parsed.users || [],
            daily_practice: parsed.daily_practice || [],
            trades: parsed.trades || [],
            mistakes: parsed.mistakes || [],
            psychology_logs: parsed.psychology_logs || [],
            daily_reviews: parsed.daily_reviews || [],
            weekly_reviews: parsed.weekly_reviews || [],
            skills: parsed.skills || [],
            msp1_setups: parsed.msp1_setups || [],
            sessions: parsed.sessions || [],
          };
        }
      }
    } catch (err) {
      console.error('[Database] Error reading local database file, initializing clean structure:', err);
    }
    return {
      users: [],
      daily_practice: [],
      trades: [],
      mistakes: [],
      psychology_logs: [],
      daily_reviews: [],
      weekly_reviews: [],
      skills: [],
      msp1_setups: [],
      sessions: [],
    };
  }

  private saveLocal(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.localData, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('[Database] Failed to save local database atomically:', err);
    }
  }

  private initLocalDemoAccount() {
    const demoEmail = 'demo@traderdiscipline.com';
    let demoUser = this.localData.users.find((u) => u.email.toLowerCase() === demoEmail);
    if (!demoUser) {
      const { hash, salt } = hashPassword('demo1234');
      demoUser = {
        id: 'usr_demo_trader',
        email: demoEmail,
        name: 'Pro Trader (Demo)',
        timezone: 'America/New_York',
        createdAt: '2026-09-01T08:00:00.000Z',
        passwordHash: hash,
        salt,
      };
      this.localData.users.push(demoUser);

      // Seed skills
      this.ensureLocalSkillsForUser(demoUser.id);

      // Seed practice
      const todayStr = new Date().toISOString().split('T')[0];
      this.localData.daily_practice.push({
        id: 'dp_demo_today',
        userId: demoUser.id,
        date: todayStr,
        marketPreparation: true,
        economicNewsChecked: true,
        marketStructureAnalysis: true,
        keyLevelsIdentified: true,
        liquidityAnalysis: true,
        tradingBiasWritten: true,
        tradingPlanPrepared: true,
        riskPlanPrepared: true,
        postMarketReviewCompleted: false,
        note: 'High impact CPI release at 8:30 AM EST. Waited for post-news 15m structure before any order execution.',
        updatedAt: new Date().toISOString(),
      });

      // Seed trades
      this.localData.trades.push(
        {
          id: 'tr_demo_1',
          userId: demoUser.id,
          date: todayStr,
          pair: 'EUR/USD',
          type: 'Buy',
          setup: 'Asia Low Liquidity Sweep + MSB',
          entry: '1.08450',
          stopLoss: '1.08320',
          takeProfit: '1.08750',
          riskPercent: '1.0',
          reasonForEntry: 'Swept Asia session lows into 1H bullish order block, 5m change of character confirmed with volume.',
          result: 'Win',
          followedPlan: true,
          note: 'Executed cleanly without hesitation. Scaled out 70% at 2R, closed rest at target.',
          psychologyState: 'Focused',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        {
          id: 'tr_demo_2',
          userId: demoUser.id,
          date: todayStr,
          pair: 'NQ',
          type: 'Sell',
          setup: 'Pre-market High Rejection',
          entry: '20450',
          stopLoss: '20490',
          takeProfit: '20370',
          riskPercent: '1.0',
          reasonForEntry: 'Failed to hold above previous day high, formed clear lower high on 3m chart.',
          result: 'Win',
          followedPlan: true,
          note: 'Protected stop loss once 1R was hit. Disciplined execution.',
          psychologyState: 'Calm',
          createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        }
      );

      // Seed mistakes
      this.localData.mistakes.push(
        {
          id: 'mis_demo_1',
          userId: demoUser.id,
          date: '2026-09-18',
          mistake: 'Early entry',
          whyHappened: 'Saw a strong 1-minute candle and feared missing the breakout before the 5-minute candle closed.',
          preventionPlan: 'Always set a strict rule: never enter before higher timeframe candle close confirmation.',
          createdAt: '2026-09-18T14:30:00.000Z',
        },
        {
          id: 'mis_demo_2',
          userId: demoUser.id,
          date: '2026-09-15',
          mistake: 'Exited too early',
          whyHappened: 'Felt nervous seeing an initial counter-tick even though market structure was strictly intact.',
          preventionPlan: 'Set alert at take profit and step away from the monitor during trade management.',
          createdAt: '2026-09-15T15:10:00.000Z',
        }
      );

      // Seed daily review
      this.localData.daily_reviews.push({
        id: 'rev_demo_today',
        userId: demoUser.id,
        date: todayStr,
        wellDone: 'Stayed completely patient during high-impact news and stuck strictly to 1% risk allocation.',
        mistakeMade: 'Checked PnL twice during the second trade instead of reading pure price structure.',
        improveTomorrow: 'Hide live PnL display during active session to remain 100% focused on execution.',
        updatedAt: new Date().toISOString(),
      });

      // Seed psychology log
      this.localData.psychology_logs.push({
        id: 'psy_demo_1',
        userId: demoUser.id,
        date: todayStr,
        state: 'Focused',
        note: 'Clear mental headspace after morning preparation checklist.',
        createdAt: new Date().toISOString(),
      });

      // Seed initial historical backtest setups (LSE & DRE)
      const initialSetups = getInitialMSP1Setups(demoUser.id);
      this.localData.msp1_setups.push(...initialSetups);

      this.saveLocal();
    } else if (demoUser) {
      // Ensure existing demo user has backtest setups if added later
      const demoUserId = demoUser.id;
      const existingMsp = this.localData.msp1_setups.filter((s) => s.userId === demoUserId);
      if (existingMsp.length === 0) {
        const initialSetups = getInitialMSP1Setups(demoUserId);
        this.localData.msp1_setups.push(...initialSetups);
        this.saveLocal();
      }
    }
  }

  private async initMongoDemoAccount() {
    try {
      const mdb = await getMongoDb();
      if (!mdb) return;

      const demoEmail = 'demo@traderdiscipline.com';
      const existing = await mdb.collection('users').findOne({ email: demoEmail });
      if (!existing) {
        const { hash, salt } = hashPassword('demo1234');
        const demoUser: UserRecord = {
          id: 'usr_demo_trader',
          email: demoEmail,
          name: 'Pro Trader (Demo)',
          timezone: 'America/New_York',
          createdAt: '2026-09-01T08:00:00.000Z',
          passwordHash: hash,
          salt,
        };
        await mdb.collection('users').insertOne(demoUser as any);
        await this.ensureMongoSkillsForUser(mdb, demoUser.id);

        const todayStr = new Date().toISOString().split('T')[0];
        await mdb.collection('daily_practice').insertOne({
          id: 'dp_demo_today',
          userId: demoUser.id,
          date: todayStr,
          marketPreparation: true,
          economicNewsChecked: true,
          marketStructureAnalysis: true,
          keyLevelsIdentified: true,
          liquidityAnalysis: true,
          tradingBiasWritten: true,
          tradingPlanPrepared: true,
          riskPlanPrepared: true,
          postMarketReviewCompleted: false,
          note: 'High impact CPI release at 8:30 AM EST. Waited for post-news 15m structure before any order execution.',
          updatedAt: new Date().toISOString(),
        } as any);

        await mdb.collection('trades').insertMany([
          {
            id: 'tr_demo_1',
            userId: demoUser.id,
            date: todayStr,
            pair: 'EUR/USD',
            type: 'Buy',
            setup: 'Asia Low Liquidity Sweep + MSB',
            entry: '1.08450',
            stopLoss: '1.08320',
            takeProfit: '1.08750',
            riskPercent: '1.0',
            reasonForEntry: 'Swept Asia session lows into 1H bullish order block, 5m change of character confirmed with volume.',
            result: 'Win',
            followedPlan: true,
            note: 'Executed cleanly without hesitation. Scaled out 70% at 2R, closed rest at target.',
            psychologyState: 'Focused',
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          },
          {
            id: 'tr_demo_2',
            userId: demoUser.id,
            date: todayStr,
            pair: 'NQ',
            type: 'Sell',
            setup: 'Pre-market High Rejection',
            entry: '20450',
            stopLoss: '20490',
            takeProfit: '20370',
            riskPercent: '1.0',
            reasonForEntry: 'Failed to hold above previous day high, formed clear lower high on 3m chart.',
            result: 'Win',
            followedPlan: true,
            note: 'Protected stop loss once 1R was hit. Disciplined execution.',
            psychologyState: 'Calm',
            createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
          },
        ] as any);

        await mdb.collection('mistakes').insertMany([
          {
            id: 'mis_demo_1',
            userId: demoUser.id,
            date: '2026-09-18',
            mistake: 'Early entry',
            whyHappened: 'Saw a strong 1-minute candle and feared missing the breakout before the 5-minute candle closed.',
            preventionPlan: 'Always set a strict rule: never enter before higher timeframe candle close confirmation.',
            createdAt: '2026-09-18T14:30:00.000Z',
          },
          {
            id: 'mis_demo_2',
            userId: demoUser.id,
            date: '2026-09-15',
            mistake: 'Exited too early',
            whyHappened: 'Felt nervous seeing an initial counter-tick even though market structure was strictly intact.',
            preventionPlan: 'Set alert at take profit and step away from the monitor during trade management.',
            createdAt: '2026-09-15T15:10:00.000Z',
          },
        ] as any);

        await mdb.collection('daily_reviews').insertOne({
          id: 'rev_demo_today',
          userId: demoUser.id,
          date: todayStr,
          wellDone: 'Stayed completely patient during high-impact news and stuck strictly to 1% risk allocation.',
          mistakeMade: 'Checked PnL twice during the second trade instead of reading pure price structure.',
          improveTomorrow: 'Hide live PnL display during active session to remain 100% focused on execution.',
          updatedAt: new Date().toISOString(),
        } as any);

        await mdb.collection('psychology_logs').insertOne({
          id: 'psy_demo_1',
          userId: demoUser.id,
          date: todayStr,
          state: 'Focused',
          note: 'Clear mental headspace after morning preparation checklist.',
          createdAt: new Date().toISOString(),
        } as any);

        const initialSetups = getInitialMSP1Setups(demoUser.id);
        await mdb.collection('msp1_setups').insertMany(initialSetups as any);

        console.log('[MongoDB Atlas] Demo trader account seeded successfully');
      } else {
        // Check if demo user has msp1_setups in MongoDB
        const mspCount = await mdb.collection('msp1_setups').countDocuments({ userId: (existing as any).id });
        if (mspCount === 0) {
          const initialSetups = getInitialMSP1Setups((existing as any).id);
          await mdb.collection('msp1_setups').insertMany(initialSetups as any);
        }
      }
    } catch (err) {
      console.warn('[MongoDB Atlas] Could not seed demo account:', err);
    }
  }

  private ensureLocalSkillsForUser(userId: string) {
    const existing = this.localData.skills.filter((s) => s.userId === userId);
    let modified = false;

    CORE_SKILLS.forEach((skillName) => {
      const found = existing.find((s) => s.skillName === skillName);
      if (!found) {
        this.localData.skills.push({
          id: `sk_${crypto.randomUUID()}`,
          userId,
          skillName,
          practiceDays: userId === 'usr_demo_trader' ? Math.floor(Math.random() * 12) + 4 : 0,
          lastPracticed: new Date().toISOString().split('T')[0],
          personalNotes:
            userId === 'usr_demo_trader'
              ? 'Daily drill: mark key swing points and observe orderflow reaction.'
              : '',
          updatedAt: new Date().toISOString(),
        });
        modified = true;
      }
    });

    if (modified) {
      this.saveLocal();
    }
  }

  private async ensureMongoSkillsForUser(mdb: any, userId: string): Promise<void> {
    const existing = await mdb.collection('skills').find({ userId }).toArray();
    for (const skillName of CORE_SKILLS) {
      const found = existing.find((s: any) => s.skillName === skillName);
      if (!found) {
        await mdb.collection('skills').insertOne({
          id: `sk_${crypto.randomUUID()}`,
          userId,
          skillName,
          practiceDays: userId === 'usr_demo_trader' ? Math.floor(Math.random() * 12) + 4 : 0,
          lastPracticed: new Date().toISOString().split('T')[0],
          personalNotes:
            userId === 'usr_demo_trader'
              ? 'Daily drill: mark key swing points and observe orderflow reaction.'
              : '',
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  // --- Auth & Users ---

  public async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const mdb = await getMongoDb();

    if (mdb) {
      const existing = await mdb.collection('users').findOne({ email: cleanEmail });
      if (existing) {
        throw new Error('An account with this email address already exists.');
      }

      const { hash, salt } = hashPassword(password);
      const userId = `usr_${crypto.randomUUID()}`;
      const userRecord: UserRecord = {
        id: userId,
        email: cleanEmail,
        name: name.trim() || 'Trader',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        createdAt: new Date().toISOString(),
        passwordHash: hash,
        salt,
      };

      await mdb.collection('users').insertOne(userRecord as any);
      await this.ensureMongoSkillsForUser(mdb, userId);

      const token = crypto.randomBytes(32).toString('hex');
      await mdb.collection('sessions').insertOne({
        token,
        userId,
        createdAt: new Date().toISOString(),
      });

      const { passwordHash: _, salt: __, ...safeUser } = userRecord;
      return { user: safeUser, token };
    }

    // Local Fallback
    const existing = this.localData.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr_${crypto.randomUUID()}`;
    const userRecord: UserRecord = {
      id: userId,
      email: cleanEmail,
      name: name.trim() || 'Trader',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt,
    };

    this.localData.users.push(userRecord);
    this.ensureLocalSkillsForUser(userId);

    const token = crypto.randomBytes(32).toString('hex');
    this.localData.sessions.push({
      token,
      userId,
      createdAt: new Date().toISOString(),
    });

    this.saveLocal();
    const { passwordHash: _, salt: __, ...safeUser } = userRecord;
    return { user: safeUser, token };
  }

  public async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const mdb = await getMongoDb();

    if (mdb) {
      const userRecord = (await mdb.collection('users').findOne({ email: cleanEmail })) as UserRecord | null;
      if (!userRecord) {
        throw new Error('Invalid email or password.');
      }

      const valid = verifyPassword(password, userRecord.passwordHash, userRecord.salt);
      if (!valid) {
        throw new Error('Invalid email or password.');
      }

      const token = crypto.randomBytes(32).toString('hex');
      await mdb.collection('sessions').insertOne({
        token,
        userId: userRecord.id,
        createdAt: new Date().toISOString(),
      });

      const { passwordHash: _, salt: __, ...safeUser } = userRecord;
      return { user: safeUser, token };
    }

    // Local Fallback
    const userRecord = this.localData.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!userRecord) {
      throw new Error('Invalid email or password.');
    }

    const valid = verifyPassword(password, userRecord.passwordHash, userRecord.salt);
    if (!valid) {
      throw new Error('Invalid email or password.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    this.localData.sessions.push({
      token,
      userId: userRecord.id,
      createdAt: new Date().toISOString(),
    });

    this.saveLocal();
    const { passwordHash: _, salt: __, ...safeUser } = userRecord;
    return { user: safeUser, token };
  }

  public async getUserByToken(token: string): Promise<User | null> {
    const mdb = await getMongoDb();
    if (mdb) {
      const session = await mdb.collection('sessions').findOne({ token });
      if (!session) return null;
      const userRecord = (await mdb.collection('users').findOne({ id: session.userId })) as UserRecord | null;
      if (!userRecord) return null;
      const { passwordHash: _, salt: __, ...safeUser } = userRecord;
      return safeUser;
    }

    // Local Fallback
    const session = this.localData.sessions.find((s) => s.token === token);
    if (!session) return null;
    const userRecord = this.localData.users.find((u) => u.id === session.userId);
    if (!userRecord) return null;
    const { passwordHash: _, salt: __, ...safeUser } = userRecord;
    return safeUser;
  }

  public async updatePassword(userId: string, currentPass: string, newPass: string): Promise<boolean> {
    const mdb = await getMongoDb();
    if (mdb) {
      const userRecord = (await mdb.collection('users').findOne({ id: userId })) as UserRecord | null;
      if (!userRecord) throw new Error('User not found.');
      const valid = verifyPassword(currentPass, userRecord.passwordHash, userRecord.salt);
      if (!valid) throw new Error('Current password is incorrect.');

      const { hash, salt } = hashPassword(newPass);
      await mdb.collection('users').updateOne(
        { id: userId },
        { $set: { passwordHash: hash, salt } }
      );
      return true;
    }

    // Local Fallback
    const userRecord = this.localData.users.find((u) => u.id === userId);
    if (!userRecord) throw new Error('User not found.');
    const valid = verifyPassword(currentPass, userRecord.passwordHash, userRecord.salt);
    if (!valid) throw new Error('Current password is incorrect.');

    const { hash, salt } = hashPassword(newPass);
    userRecord.passwordHash = hash;
    userRecord.salt = salt;
    this.saveLocal();
    return true;
  }

  public async updateUserSettings(userId: string, name: string, timezone: string): Promise<User> {
    const mdb = await getMongoDb();
    if (mdb) {
      const updateFields: any = {};
      if (name) updateFields.name = name.trim();
      if (timezone) updateFields.timezone = timezone.trim();

      await mdb.collection('users').updateOne({ id: userId }, { $set: updateFields });
      const userRecord = (await mdb.collection('users').findOne({ id: userId })) as UserRecord | null;
      if (!userRecord) throw new Error('User not found.');
      const { passwordHash: _, salt: __, ...safeUser } = userRecord;
      return safeUser;
    }

    // Local Fallback
    const userRecord = this.localData.users.find((u) => u.id === userId);
    if (!userRecord) throw new Error('User not found.');
    if (name) userRecord.name = name.trim();
    if (timezone) userRecord.timezone = timezone.trim();
    this.saveLocal();
    const { passwordHash: _, salt: __, ...safeUser } = userRecord;
    return safeUser;
  }

  // --- Daily Practice ---

  public async getDailyPractice(userId: string, date: string): Promise<DailyPractice> {
    const mdb = await getMongoDb();
    if (mdb) {
      let practice = (await mdb.collection('daily_practice').findOne({ userId, date })) as DailyPractice | null;
      if (!practice) {
        practice = {
          id: `dp_${crypto.randomUUID()}`,
          userId,
          date,
          marketPreparation: false,
          economicNewsChecked: false,
          marketStructureAnalysis: false,
          keyLevelsIdentified: false,
          liquidityAnalysis: false,
          tradingBiasWritten: false,
          tradingPlanPrepared: false,
          riskPlanPrepared: false,
          postMarketReviewCompleted: false,
          note: '',
          updatedAt: new Date().toISOString(),
        };
        await mdb.collection('daily_practice').insertOne(practice as any);
      }
      return practice;
    }

    // Local Fallback
    let practice = this.localData.daily_practice.find((p) => p.userId === userId && p.date === date);
    if (!practice) {
      practice = {
        id: `dp_${crypto.randomUUID()}`,
        userId,
        date,
        marketPreparation: false,
        economicNewsChecked: false,
        marketStructureAnalysis: false,
        keyLevelsIdentified: false,
        liquidityAnalysis: false,
        tradingBiasWritten: false,
        tradingPlanPrepared: false,
        riskPlanPrepared: false,
        postMarketReviewCompleted: false,
        note: '',
        updatedAt: new Date().toISOString(),
      };
      this.localData.daily_practice.push(practice);
      this.saveLocal();
    }
    return practice;
  }

  public async saveDailyPractice(userId: string, item: Partial<DailyPractice> & { date: string }): Promise<DailyPractice> {
    const mdb = await getMongoDb();
    if (mdb) {
      const existing = (await mdb.collection('daily_practice').findOne({ userId, date: item.date })) as DailyPractice | null;
      if (!existing) {
        const newPractice: DailyPractice = {
          id: `dp_${crypto.randomUUID()}`,
          userId,
          date: item.date,
          marketPreparation: !!item.marketPreparation,
          economicNewsChecked: !!item.economicNewsChecked,
          marketStructureAnalysis: !!item.marketStructureAnalysis,
          keyLevelsIdentified: !!item.keyLevelsIdentified,
          liquidityAnalysis: !!item.liquidityAnalysis,
          tradingBiasWritten: !!item.tradingBiasWritten,
          tradingPlanPrepared: !!item.tradingPlanPrepared,
          riskPlanPrepared: !!item.riskPlanPrepared,
          postMarketReviewCompleted: !!item.postMarketReviewCompleted,
          note: item.note || '',
          updatedAt: new Date().toISOString(),
        };
        await mdb.collection('daily_practice').insertOne(newPractice as any);
        return newPractice;
      } else {
        const updated = {
          ...existing,
          ...item,
          userId,
          date: item.date,
          updatedAt: new Date().toISOString(),
        };
        await mdb.collection('daily_practice').updateOne({ userId, date: item.date }, { $set: updated });
        return updated;
      }
    }

    // Local Fallback
    let practice = this.localData.daily_practice.find((p) => p.userId === userId && p.date === item.date);
    if (!practice) {
      practice = {
        id: `dp_${crypto.randomUUID()}`,
        userId,
        date: item.date,
        marketPreparation: !!item.marketPreparation,
        economicNewsChecked: !!item.economicNewsChecked,
        marketStructureAnalysis: !!item.marketStructureAnalysis,
        keyLevelsIdentified: !!item.keyLevelsIdentified,
        liquidityAnalysis: !!item.liquidityAnalysis,
        tradingBiasWritten: !!item.tradingBiasWritten,
        tradingPlanPrepared: !!item.tradingPlanPrepared,
        riskPlanPrepared: !!item.riskPlanPrepared,
        postMarketReviewCompleted: !!item.postMarketReviewCompleted,
        note: item.note || '',
        updatedAt: new Date().toISOString(),
      };
      this.localData.daily_practice.push(practice);
    } else {
      Object.assign(practice, item, { updatedAt: new Date().toISOString(), userId, date: item.date });
    }
    this.saveLocal();
    return practice;
  }

  public async getAllDailyPractices(userId: string): Promise<DailyPractice[]> {
    const mdb = await getMongoDb();
    if (mdb) {
      const records = (await mdb.collection('daily_practice').find({ userId }).sort({ date: -1 }).toArray()) as unknown as DailyPractice[];
      return records;
    }
    return this.localData.daily_practice.filter((p) => p.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
  }

  // --- Trades ---

  public async getTrades(userId: string): Promise<Trade[]> {
    const mdb = await getMongoDb();
    if (mdb) {
      const list = (await mdb.collection('trades').find({ userId }).sort({ date: -1, createdAt: -1 }).toArray()) as unknown as Trade[];
      return list;
    }
    return this.localData.trades.filter((t) => t.userId === userId).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }

  public async addTrade(userId: string, trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>): Promise<Trade> {
    const newTrade: Trade = {
      ...trade,
      id: `tr_${crypto.randomUUID()}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    const mdb = await getMongoDb();
    if (mdb) {
      await mdb.collection('trades').insertOne(newTrade as any);
      return newTrade;
    }

    this.localData.trades.push(newTrade);
    this.saveLocal();
    return newTrade;
  }

  public async deleteTrade(userId: string, tradeId: string): Promise<boolean> {
    const mdb = await getMongoDb();
    if (mdb) {
      const result = await mdb.collection('trades').deleteOne({ id: tradeId, userId });
      return result.deletedCount > 0;
    }

    const initialLen = this.localData.trades.length;
    this.localData.trades = this.localData.trades.filter((t) => !(t.id === tradeId && t.userId === userId));
    const deleted = this.localData.trades.length < initialLen;
    if (deleted) this.saveLocal();
    return deleted;
  }

  // --- Backtest Setups (LSE & DRE) ---

  public async getMSP1Setups(userId: string): Promise<MSP1Setup[]> {
    const mdb = await getMongoDb();
    if (mdb) {
      const list = (await mdb
        .collection('msp1_setups')
        .find({ userId })
        .sort({ date: -1, createdAt: -1 })
        .toArray()) as unknown as MSP1Setup[];
      return list;
    }
    return this.localData.msp1_setups
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }

  public async getMSP1SetupById(userId: string, id: string): Promise<MSP1Setup | null> {
    const mdb = await getMongoDb();
    if (mdb) {
      const setup = await mdb.collection('msp1_setups').findOne({ id, userId });
      return (setup as unknown as MSP1Setup) || null;
    }
    return this.localData.msp1_setups.find((s) => s.id === id && s.userId === userId) || null;
  }

  public async getNextMSP1SetupId(userId: string): Promise<string> {
    const setups = await this.getMSP1Setups(userId);
    let maxNumber = 0;
    for (const setup of setups) {
      if (setup.setupId) {
        const matches = setup.setupId.match(/(\d+)/g);
        if (matches && matches.length > 0) {
          const num = parseInt(matches[matches.length - 1], 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }
    const nextNum = maxNumber + 1;
    return `TR-${String(nextNum).padStart(4, '0')}`;
  }

  public async addMSP1Setup(
    userId: string,
    setup: Omit<MSP1Setup, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<MSP1Setup> {
    const now = new Date().toISOString();
    let assignedSetupId = setup.setupId?.trim();
    if (!assignedSetupId) {
      assignedSetupId = await this.getNextMSP1SetupId(userId);
    }
    const newSetup: MSP1Setup = {
      ...setup,
      setupId: assignedSetupId,
      id: `tr_${crypto.randomUUID()}`,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    const mdb = await getMongoDb();
    if (mdb) {
      await mdb.collection('msp1_setups').insertOne(newSetup as any);
      return newSetup;
    }

    this.localData.msp1_setups.push(newSetup);
    this.saveLocal();
    return newSetup;
  }

  public async updateMSP1Setup(
    userId: string,
    id: string,
    updates: Partial<MSP1Setup>
  ): Promise<MSP1Setup> {
    const now = new Date().toISOString();
    const mdb = await getMongoDb();
    if (mdb) {
      const { id: _, userId: __, createdAt: ___, ...fieldsToUpdate } = updates as any;
      await mdb.collection('msp1_setups').updateOne(
        { id, userId },
        { $set: { ...fieldsToUpdate, updatedAt: now } }
      );
      const updated = await mdb.collection('msp1_setups').findOne({ id, userId });
      return updated as unknown as MSP1Setup;
    }

    const idx = this.localData.msp1_setups.findIndex((s) => s.id === id && s.userId === userId);
    if (idx === -1) {
      throw new Error('Trade setup not found');
    }
    const updated: MSP1Setup = {
      ...this.localData.msp1_setups[idx],
      ...updates,
      updatedAt: now,
    };
    this.localData.msp1_setups[idx] = updated;
    this.saveLocal();
    return updated;
  }

  public async deleteMSP1Setup(userId: string, id: string): Promise<boolean> {
    const mdb = await getMongoDb();
    if (mdb) {
      const result = await mdb.collection('msp1_setups').deleteOne({
        userId,
        $or: [{ id }, { setupId: id }],
      });
      return result.deletedCount > 0;
    }

    const initialLen = this.localData.msp1_setups.length;
    this.localData.msp1_setups = this.localData.msp1_setups.filter(
      (s) => !(s.userId === userId && (s.id === id || s.setupId === id))
    );
    const deleted = this.localData.msp1_setups.length < initialLen;
    if (deleted) this.saveLocal();
    return deleted;
  }

  // --- Mistakes ---

  public async getMistakes(userId: string): Promise<MistakeLog[]> {
    const mdb = await getMongoDb();
    if (mdb) {
      const list = (await mdb.collection('mistakes').find({ userId }).sort({ date: -1, createdAt: -1 }).toArray()) as unknown as MistakeLog[];
      return list;
    }
    return this.localData.mistakes.filter((m) => m.userId === userId).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }

  public async addMistake(userId: string, mistake: Omit<MistakeLog, 'id' | 'userId' | 'createdAt'>): Promise<MistakeLog> {
    const newMistake: MistakeLog = {
      ...mistake,
      id: `mis_${crypto.randomUUID()}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    const mdb = await getMongoDb();
    if (mdb) {
      await mdb.collection('mistakes').insertOne(newMistake as any);
      return newMistake;
    }

    this.localData.mistakes.push(newMistake);
    this.saveLocal();
    return newMistake;
  }

  public async deleteMistake(userId: string, mistakeId: string): Promise<boolean> {
    const mdb = await getMongoDb();
    if (mdb) {
      const result = await mdb.collection('mistakes').deleteOne({ id: mistakeId, userId });
      return result.deletedCount > 0;
    }

    const initialLen = this.localData.mistakes.length;
    this.localData.mistakes = this.localData.mistakes.filter((m) => !(m.id === mistakeId && m.userId === userId));
    const deleted = this.localData.mistakes.length < initialLen;
    if (deleted) this.saveLocal();
    return deleted;
  }

  // --- Psychology ---

  public async getPsychologyLogs(userId: string): Promise<PsychologyLog[]> {
    const mdb = await getMongoDb();
    if (mdb) {
      const list = (await mdb.collection('psychology_logs').find({ userId }).sort({ createdAt: -1 }).toArray()) as unknown as PsychologyLog[];
      return list;
    }
    return this.localData.psychology_logs.filter((p) => p.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public async addPsychologyLog(userId: string, log: Omit<PsychologyLog, 'id' | 'userId' | 'createdAt'>): Promise<PsychologyLog> {
    const newLog: PsychologyLog = {
      ...log,
      id: `psy_${crypto.randomUUID()}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    const mdb = await getMongoDb();
    if (mdb) {
      await mdb.collection('psychology_logs').insertOne(newLog as any);
      return newLog;
    }

    this.localData.psychology_logs.push(newLog);
    this.saveLocal();
    return newLog;
  }

  // --- Reviews ---

  public async getDailyReview(userId: string, date: string): Promise<DailyReview | null> {
    const mdb = await getMongoDb();
    if (mdb) {
      const rev = (await mdb.collection('daily_reviews').findOne({ userId, date })) as DailyReview | null;
      return rev;
    }
    return this.localData.daily_reviews.find((r) => r.userId === userId && r.date === date) || null;
  }

  public async saveDailyReview(userId: string, review: Omit<DailyReview, 'id' | 'userId' | 'updatedAt'>): Promise<DailyReview> {
    const mdb = await getMongoDb();
    if (mdb) {
      const found = (await mdb.collection('daily_reviews').findOne({ userId, date: review.date })) as DailyReview | null;
      if (!found) {
        const newReview: DailyReview = {
          id: `rev_d_${crypto.randomUUID()}`,
          userId,
          ...review,
          updatedAt: new Date().toISOString(),
        };
        await mdb.collection('daily_reviews').insertOne(newReview as any);
        return newReview;
      } else {
        const updated = {
          ...found,
          ...review,
          updatedAt: new Date().toISOString(),
        };
        await mdb.collection('daily_reviews').updateOne({ userId, date: review.date }, { $set: updated });
        return updated;
      }
    }

    let found = this.localData.daily_reviews.find((r) => r.userId === userId && r.date === review.date);
    if (!found) {
      found = {
        id: `rev_d_${crypto.randomUUID()}`,
        userId,
        ...review,
        updatedAt: new Date().toISOString(),
      };
      this.localData.daily_reviews.push(found);
    } else {
      Object.assign(found, review, { updatedAt: new Date().toISOString() });
    }
    this.saveLocal();
    return found;
  }

  public async getWeeklyReview(userId: string, weekStartDate: string): Promise<WeeklyReview | null> {
    const mdb = await getMongoDb();
    if (mdb) {
      const rev = (await mdb.collection('weekly_reviews').findOne({ userId, weekStartDate })) as WeeklyReview | null;
      return rev;
    }
    return this.localData.weekly_reviews.find((r) => r.userId === userId && r.weekStartDate === weekStartDate) || null;
  }

  public async saveWeeklyReview(userId: string, review: Omit<WeeklyReview, 'id' | 'userId' | 'updatedAt'>): Promise<WeeklyReview> {
    const mdb = await getMongoDb();
    if (mdb) {
      const found = (await mdb.collection('weekly_reviews').findOne({ userId, weekStartDate: review.weekStartDate })) as WeeklyReview | null;
      if (!found) {
        const newReview: WeeklyReview = {
          id: `rev_w_${crypto.randomUUID()}`,
          userId,
          ...review,
          updatedAt: new Date().toISOString(),
        };
        await mdb.collection('weekly_reviews').insertOne(newReview as any);
        return newReview;
      } else {
        const updated = {
          ...found,
          ...review,
          updatedAt: new Date().toISOString(),
        };
        await mdb.collection('weekly_reviews').updateOne({ userId, weekStartDate: review.weekStartDate }, { $set: updated });
        return updated;
      }
    }

    let found = this.localData.weekly_reviews.find((r) => r.userId === userId && r.weekStartDate === review.weekStartDate);
    if (!found) {
      found = {
        id: `rev_w_${crypto.randomUUID()}`,
        userId,
        ...review,
        updatedAt: new Date().toISOString(),
      };
      this.localData.weekly_reviews.push(found);
    } else {
      Object.assign(found, review, { updatedAt: new Date().toISOString() });
    }
    this.saveLocal();
    return found;
  }

  public async getAllReviews(userId: string): Promise<{ daily: DailyReview[]; weekly: WeeklyReview[] }> {
    const mdb = await getMongoDb();
    if (mdb) {
      const daily = (await mdb.collection('daily_reviews').find({ userId }).sort({ date: -1 }).toArray()) as unknown as DailyReview[];
      const weekly = (await mdb.collection('weekly_reviews').find({ userId }).sort({ weekStartDate: -1 }).toArray()) as unknown as WeeklyReview[];
      return { daily, weekly };
    }
    return {
      daily: this.localData.daily_reviews.filter((r) => r.userId === userId).sort((a, b) => b.date.localeCompare(a.date)),
      weekly: this.localData.weekly_reviews.filter((r) => r.userId === userId).sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate)),
    };
  }

  // --- Skills ---

  public async getSkills(userId: string): Promise<SkillRecord[]> {
    const mdb = await getMongoDb();
    if (mdb) {
      await this.ensureMongoSkillsForUser(mdb, userId);
      const list = (await mdb.collection('skills').find({ userId }).toArray()) as unknown as SkillRecord[];
      return list;
    }
    this.ensureLocalSkillsForUser(userId);
    return this.localData.skills.filter((s) => s.userId === userId);
  }

  public async logSkillPractice(userId: string, skillId: string, notes?: string): Promise<SkillRecord> {
    const mdb = await getMongoDb();
    const todayStr = new Date().toISOString().split('T')[0];

    if (mdb) {
      const skill = (await mdb.collection('skills').findOne({ id: skillId, userId })) as SkillRecord | null;
      if (!skill) throw new Error('Skill not found.');

      let days = skill.practiceDays;
      if (skill.lastPracticed !== todayStr) {
        days += 1;
      }
      const updated: SkillRecord = {
        ...skill,
        practiceDays: days,
        lastPracticed: todayStr,
        personalNotes: notes !== undefined ? notes : skill.personalNotes,
        updatedAt: new Date().toISOString(),
      };
      await mdb.collection('skills').updateOne({ id: skillId, userId }, { $set: updated });
      return updated;
    }

    this.ensureLocalSkillsForUser(userId);
    const skill = this.localData.skills.find((s) => s.id === skillId && s.userId === userId);
    if (!skill) throw new Error('Skill not found.');

    if (skill.lastPracticed !== todayStr) {
      skill.practiceDays += 1;
      skill.lastPracticed = todayStr;
    }
    if (notes !== undefined) {
      skill.personalNotes = notes;
    }
    skill.updatedAt = new Date().toISOString();
    this.saveLocal();
    return skill;
  }

  public async updateSkillNotes(userId: string, skillId: string, notes: string): Promise<SkillRecord> {
    const mdb = await getMongoDb();
    if (mdb) {
      const skill = (await mdb.collection('skills').findOne({ id: skillId, userId })) as SkillRecord | null;
      if (!skill) throw new Error('Skill not found.');
      const updated: SkillRecord = {
        ...skill,
        personalNotes: notes,
        updatedAt: new Date().toISOString(),
      };
      await mdb.collection('skills').updateOne({ id: skillId, userId }, { $set: updated });
      return updated;
    }

    this.ensureLocalSkillsForUser(userId);
    const skill = this.localData.skills.find((s) => s.id === skillId && s.userId === userId);
    if (!skill) throw new Error('Skill not found.');
    skill.personalNotes = notes;
    skill.updatedAt = new Date().toISOString();
    this.saveLocal();
    return skill;
  }

  // --- Data Export & Clear ---

  public async exportUserData(userId: string): Promise<any> {
    const mdb = await getMongoDb();
    if (mdb) {
      const user = await mdb.collection('users').findOne({ id: userId });
      const daily_practice = await mdb.collection('daily_practice').find({ userId }).toArray();
      const trades = await mdb.collection('trades').find({ userId }).toArray();
      const mistakes = await mdb.collection('mistakes').find({ userId }).toArray();
      const psychology_logs = await mdb.collection('psychology_logs').find({ userId }).toArray();
      const daily_reviews = await mdb.collection('daily_reviews').find({ userId }).toArray();
      const weekly_reviews = await mdb.collection('weekly_reviews').find({ userId }).toArray();
      const skills = await mdb.collection('skills').find({ userId }).toArray();
      const msp1_setups = await mdb.collection('msp1_setups').find({ userId }).toArray();

      return {
        exportDate: new Date().toISOString(),
        storageProvider: 'mongodb_atlas',
        user: user ? { id: (user as any).id, email: (user as any).email, name: (user as any).name } : null,
        daily_practice,
        trades,
        mistakes,
        psychology_logs,
        daily_reviews,
        weekly_reviews,
        skills,
        msp1_setups,
      };
    }

    return {
      exportDate: new Date().toISOString(),
      storageProvider: 'local_storage',
      user: this.localData.users.find((u) => u.id === userId),
      daily_practice: this.localData.daily_practice.filter((p) => p.userId === userId),
      trades: this.localData.trades.filter((t) => t.userId === userId),
      mistakes: this.localData.mistakes.filter((m) => m.userId === userId),
      psychology_logs: this.localData.psychology_logs.filter((p) => p.userId === userId),
      daily_reviews: this.localData.daily_reviews.filter((r) => r.userId === userId),
      weekly_reviews: this.localData.weekly_reviews.filter((r) => r.userId === userId),
      skills: this.localData.skills.filter((s) => s.userId === userId),
      msp1_setups: this.localData.msp1_setups.filter((s) => s.userId === userId),
    };
  }

  public async clearUserData(userId: string): Promise<void> {
    const mdb = await getMongoDb();
    if (mdb) {
      await mdb.collection('daily_practice').deleteMany({ userId });
      await mdb.collection('trades').deleteMany({ userId });
      await mdb.collection('mistakes').deleteMany({ userId });
      await mdb.collection('psychology_logs').deleteMany({ userId });
      await mdb.collection('daily_reviews').deleteMany({ userId });
      await mdb.collection('weekly_reviews').deleteMany({ userId });
      await mdb.collection('skills').deleteMany({ userId });
      await mdb.collection('msp1_setups').deleteMany({ userId });
      await this.ensureMongoSkillsForUser(mdb, userId);
      return;
    }

    this.localData.daily_practice = this.localData.daily_practice.filter((p) => p.userId !== userId);
    this.localData.trades = this.localData.trades.filter((t) => t.userId !== userId);
    this.localData.mistakes = this.localData.mistakes.filter((m) => m.userId !== userId);
    this.localData.psychology_logs = this.localData.psychology_logs.filter((p) => p.userId !== userId);
    this.localData.daily_reviews = this.localData.daily_reviews.filter((r) => r.userId !== userId);
    this.localData.weekly_reviews = this.localData.weekly_reviews.filter((r) => r.userId !== userId);
    this.localData.skills = this.localData.skills.filter((s) => s.userId !== userId);
    this.localData.msp1_setups = this.localData.msp1_setups.filter((s) => s.userId !== userId);
    this.ensureLocalSkillsForUser(userId);
    this.saveLocal();
  }

  public getStatus() {
    return getMongoStatus();
  }
}

export const db = new Database();
