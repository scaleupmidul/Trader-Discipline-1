import React from 'react';
import {
  Layers,
  Target,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Scale,
  Ban,
  Clock,
  Zap,
  Waves,
} from 'lucide-react';

export const MSP1RulesView: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            System Specification
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
            Gold (XAU/USD) · LSE &amp; DRE Models
          </span>
        </div>
        <h1 className="text-lg sm:text-2xl font-bold text-white leading-tight">
          System Rules: LSE &amp; DRE Backtesting Framework
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Comparing two systematic execution models: <strong>LSE (Liquidity Sweep Entry)</strong> and <strong>DRE (Demand Reaction Entry)</strong> on Gold (XAU/USD).
          Every historical trade recorded in this journal must strictly satisfy the criteria of its assigned strategy.
        </p>

        {/* LSE vs DRE Strategy Comparison Matrix */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs font-mono text-amber-400 uppercase tracking-wider">
                Model A: LSE (Liquidity Sweep Entry)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Sweep Required</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Must take a key previous High/Low (Previous High/Low, Equal Highs/Lows, Session Extremes).</li>
              <li>Price must show immediate rejection and reclaim back across the swept level.</li>
              <li>Opposite MSS on M15/H1 with completed candle body close is mandatory.</li>
              <li>Strong impulsive displacement must follow the shift.</li>
              <li>Entry executed on M5 controlled pullback into discount/premium reaction zone.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/15 border border-indigo-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs font-mono text-indigo-400 uppercase tracking-wider">
                Model B: DRE (Demand Reaction Entry)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Direct Reaction</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Price directly taps an unmitigated H1 Demand (Buy) or Supply (Sell) zone.</li>
              <li>Does <strong>not</strong> require a prior liquidity sweep: focuses on zone defense and mitigation.</li>
              <li>M15 confirmation: clear rejection or shift away from the zone boundary.</li>
              <li>FVG or orderflow shift can be used as structural confirmation.</li>
              <li>Entry executed on M5 pullback with minimum 1:2.0 planned RR.</li>
            </ul>
          </div>
        </div>

        {/* Level Break != Sweep Critical Rule */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Core Distinction: Level Break ≠ Liquidity Sweep</strong>
            <span>
              When price breaches a previous swing point and continues aggressively without rejection or reclaim, it is a <strong>BOS (Break of Structure / Continuation)</strong>, NOT a sweep. Never attempt reversal entries against a confirmed continuation break.
            </span>
          </div>
        </div>

        {/* Visual Multi-Timeframe Roadmap */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 font-semibold mb-2">
            ৩-ধাপের মাল্টি-টাইমফ্রেম এক্সিকিউশন ফ্লো:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
              <span className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">1</span>
              <div className="min-w-0">
                <div className="font-bold font-mono text-xs">H1 স্ট্রাকচার ও কি-লেভেল</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">মার্কেট বায়াস ও ডিমান্ড/সাপ্লাই</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
              <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 font-mono">2</span>
              <div className="min-w-0">
                <div className="font-bold font-mono text-xs">M15 লিকুইডিটি ও MSS</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Sweep / Reaction &amp; Reclaim</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <span className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">3</span>
              <div className="min-w-0">
                <div className="font-bold font-mono text-xs">M5 এন্ট্রি ও রিস্ক এক্সিকিউশন</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">পুলব্যাক, ট্রিগার ও ফিক্সড SL/TP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Sequence Deep Dive */}
      <div className="space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
            ৩-ধাপের মাল্টি-টাইমফ্রেম এক্সিকিউশন সিকোয়েন্স (H1 → M15 → M5)
          </h2>
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">ধাপ ১ হতে ৩</span>
        </div>

        {/* Step 1: H1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-mono text-xs border border-blue-500/20 shrink-0 mt-0.5 sm:mt-0">
                ১
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  ধাপ ১: ১-ঘণ্টা মার্কেট বায়াস ও গুরুত্বপূর্ণ কি-লেভেল (H1)
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">টাইমফ্রেম: ১ ঘণ্টা (1 Hour - H1)</span>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              কন্টেক্সট ও স্ট্রাকচার
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> বুলিশ H1 বায়াস (মার্কেট ঊর্ধ্বমুখী)
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                চার্টে সুস্পষ্ট <strong>Higher Highs এবং Higher Lows (HH + HL)</strong> তৈরি হবে অথবা আনমিটিগেটেড ডিমান্ড জোনে পৌঁছাবে। বুলিশ বায়াস থাকলে কেবল <strong>BUY সেটআপ</strong> বিবেচনা করা যাবে।
              </p>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> বেয়ারিশ H1 বায়াস (মার্কেট নিম্নমুখী)
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                চার্টে সুস্পষ্ট <strong>Lower Lows এবং Lower Highs (LH + LL)</strong> তৈরি হবে অথবা আনমিটিগেটেড সাপ্লাই জোনে পৌঁছাবে। বেয়ারিশ বায়াস থাকলে কেবল <strong>SELL সেটআপ</strong> বিবেচনা করা যাবে।
              </p>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-xs flex items-start gap-2.5">
            <Ban className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white">নিউট্রাল বা অস্পষ্ট স্ট্রাকচার:</strong> যদি H1 মার্কেট রেঞ্জিং বা টাইট চপে আটকে থাকে এবং কোনো স্পষ্ট সুইং হাই বা সুইং লো না থাকে, তবে কঠোর নিয়ম: <strong>ট্রেড নেওয়া সম্পূর্ণ নিষেধ (NO TRADE)</strong>।
            </span>
          </div>
        </div>

        {/* Step 2: M15 */}
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-400/80 dark:border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-900/60 pb-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold font-mono text-xs shrink-0 mt-0.5 sm:mt-0">
                ২
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  ধাপ ২: লিকুইডিটি ইভেন্ট ও স্ট্রাকচারাল শিফট কনফার্মেশন (M15)
                </h3>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold block mt-0.5 font-mono">
                  ★ LSE বনাম DRE স্পেসিফিকেশন ও ক্যান্ডেল বডি ক্লোজ
                </span>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
              কনফার্মেশন স্তর
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="font-bold text-amber-900 dark:text-amber-300 font-mono flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Model A (LSE) — Sweep + Reversal</span>
              </div>
              <ul className="text-slate-700 dark:text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                <li>পূর্ববর্তী High/Low সুইপ করে রিজেকশন প্রদর্শন।</li>
                <li>সুইপ করা লেভেলের ভেতরে প্রাইস ফিরে এসে Reclaim করা।</li>
                <li>বিপরীত দিকে M15 ক্যান্ডেল বডি ক্লোজ দিয়ে MSS কনফার্ম করা।</li>
                <li>MSS-এর পরে শক্তিশালী ডিসপ্লেসমেন্ট (Displacement) হওয়া বাধ্যতামূলক।</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
              <div className="font-bold text-indigo-900 dark:text-indigo-300 font-mono flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-indigo-500" />
                <span>Model B (DRE) — Demand/Supply Reaction</span>
              </div>
              <ul className="text-slate-700 dark:text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                <li>H1 আনমিটিগেটেড ডিমান্ড (Buy) বা সাপ্লাই (Sell) সরাসরি টাচ করা।</li>
                <li>জোন থেকে ডিফেন্সিভ রিঅ্যাকশন বা বাউন্স দৃশ্যমান হওয়া।</li>
                <li>M15 এ FVG বা ছোট স্ট্রাকচার শিফট দ্বারা বায়ার/সেলারদের নিয়ন্ত্রণ প্রমাণ করা।</li>
                <li>কোনো পূর্ববর্তী সুইপ জরুরি নয়—জোনের রিঅ্যাকশনই মূল দর্শন।</li>
              </ul>
            </div>
          </div>

          {/* CALLOUT BOX */}
          <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs leading-relaxed space-y-2">
            <div className="flex items-start gap-2 font-bold text-slate-900 dark:text-white">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Level Break ≠ Liquidity Sweep কঠোর নিয়ম:</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              প্রাইস যখন পূর্ববর্তী সুইং লেভেল ব্রেক করে কোনো রিজেকশন বা রিক্লেইম ছাড়া দ্রুত এগিয়ে যেতে থাকে, তখন এটি একটি <strong>BOS (Break of Structure / Continuation)</strong>। এমন ব্রেকআউটে কখনো রিভার্সাল ট্রেড নেওয়া যাবে না। সুইপ হতে হলে অবশ্যই লেভেল ছাড়িয়ে দ্রুত ভেতরে ফিরে আসার দৃশ্যমান প্রমাণ থাকতে হবে।
            </p>
          </div>
        </div>

        {/* Step 3: M5 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono text-xs border border-emerald-500/20 shrink-0 mt-0.5 sm:mt-0">
                ৩
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  ধাপ ৩: ৫ মিনিটের রিফাইন্ড পুলব্যাক ও এন্ট্রি ট্রিগার (M5)
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">টাইমফ্রেম: ৫ মিনিট (5 Minutes - M5)</span>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              এক্সিকিউশন ও রিস্ক
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              M15 কনফার্মেশনের পর সরাসরি অন্ধের মতো এন্ট্রি নেওয়া যাবে না। প্রাইসকে অবশ্যই M5-এ একটি নিয়ন্ত্রিত পুলব্যাক (Controlled Pullback) সম্পন্ন করতে হবে:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> বৈধ স্বাস্থ্যকর পুলব্যাক (Healthy Pullback)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  ডিসপ্লেসমেন্টের পর প্রাইস ছোট ও নিয়ন্ত্রিত ক্যান্ডেলে ডিসকাউন্ট (Buy) বা প্রিমিয়াম (Sell) রিঅ্যাকশন বেসে ফিরে আসে এবং রিজেকশন পিন বার বা এঙ্গালফিং দিয়ে মোমেন্টাম শুরু করে।
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 space-y-1.5">
                <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 font-mono">
                  <Ban className="w-3.5 h-3.5" /> দুর্বল বা অনুপস্থিত পুলব্যাক (Weak / No Pullback)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  যদি প্রাইস কোনো পুলব্যাক ছাড়াই সোজা টার্গেটের দিকে উড়ে যায় (Chase নয়), কিংবা পুলব্যাকের গতি অত্যন্ত আগ্রাসী হয়—তবে এমন পরিস্থিতিতে এন্ট্রি মিস হলে তা মিসড সেটআপ হিসেবে রেকর্ড করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Point Pre-Trade Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              ট্রেড নেওয়ার আগে ৬-দফার প্রাক-এক্সিকিউশন চেকলিস্ট
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            ৬টির প্রতিটি শর্ত সত্য হওয়া বাধ্যতামূলক
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
          {/* ① H1 Context */}
          <div className="p-3.5 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-700 dark:text-blue-400 font-mono text-xs flex items-center gap-1.5">
                ① H1 — মার্কেট বায়াস ও ট্রেন্ড
              </span>
              <span className="text-[10px] font-mono text-slate-500">1 Hour</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>H1-এ পরিষ্কার ট্রেন্ড ও সুইং স্ট্রাকচার দৃশ্যমান কি?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>ট্রেডের দিক H1 বায়াসের সাথে ১০০% সংগতিপূর্ণ কি?</span>
              </li>
            </ul>
          </div>

          {/* ② Key Level */}
          <div className="p-3.5 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-700 dark:text-purple-400 font-mono text-xs flex items-center gap-1.5">
                ② Level — গুরুত্বপূর্ণ ডিমান্ড / সাপ্লাই
              </span>
              <span className="text-[10px] font-mono text-slate-500">Key Zone</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span>প্রাইস কি কোনো আনমিটিগেটেড ও শক্তিশালী কি-লেভেলে আছে?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span>লেভেল থেকে স্পষ্ট প্রতিক্রিয়া বা রিজেকশন দেখা যাচ্ছে কি?</span>
              </li>
            </ul>
          </div>

          {/* ③ M15 Event */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 dark:text-amber-300 font-mono text-xs flex items-center gap-1.5">
                ③ M15 — লিকুইডিটি ও MSS
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-600">বাধ্যতামূলক</span>
            </div>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>LSE হলে পূর্ববর্তী সুইপ + রিক্লেইম হয়েছে কি?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>পূর্ণাঙ্গ ক্যান্ডেল বডি ক্লোজ দিয়ে MSS শিফট হয়েছে কি?</span>
              </li>
            </ul>
          </div>

          {/* ④ M5 Entry */}
          <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                ④ M5 — পুলব্যাক ও ট্রিগার
              </span>
              <span className="text-[10px] font-mono text-slate-500">5 Minutes</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>স্বাস্থ্যকর ও নিয়ন্ত্রিত পুলব্যাক সম্পন্ন হয়েছে কি?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>পরিষ্কার প্রাইস অ্যাকশন ট্রিগার ক্যান্ডেল তৈরি হয়েছে কি?</span>
              </li>
            </ul>
          </div>

          {/* ⑤ Risk */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs flex items-center gap-1.5">
                ⑤ Risk — স্টপ লস ও ক্যাপিটাল সুরক্ষা
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-500">1R Fixed</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>যৌক্তিক স্ট্রাকচারাল ইনভ্যালিডেশন লেভেলে SL রাখা হয়েছে কি?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>প্রতি ট্রেডে নির্ধারিত স্থির ১R রিস্ক সঠিকভাবে ক্যালকুলেট করা হয়েছে কি?</span>
              </li>
            </ul>
          </div>

          {/* ⑥ Target */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs flex items-center gap-1.5">
                ⑥ Target — লাভ ও অপোজিং জোন
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-500">Min 2R</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>ন্যূনতম ১:২.০ প্ল্যানড আরআর (RR) কি পরিষ্কারভাবে পাওয়া যাচ্ছে?</span>
              </li>
              <li className="flex items-start gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
                <Ban className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>২R টার্গেটের আগে অপোজিং জোন থাকলে → সরাসরি No Trade!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mandatory 3 Discipline Tracking Fields */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            প্রতিটি ট্রেডে ৩টি শৃঙ্খলা ট্র্যাকিং ফিল্ড অবশ্যই রেকর্ড করবেন
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* A. Entry Quality */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                A. Entry Quality
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                A / B / C
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              সেটআপটি চার্টে কতটা পরিষ্কার ও নিখুঁত ছিল তার গ্রেডিং দিন:
            </p>
            <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
              <div><strong className="text-emerald-600">Grade A:</strong> সম্পূর্ণ টেক্সটবুক নিখুঁত সেটআপ।</div>
              <div><strong className="text-blue-600">Grade B:</strong> বৈধ কিন্তু সামান্য অপূর্ণতা রয়েছে।</div>
              <div><strong className="text-amber-600">Grade C:</strong> কিছুটা আক্রমণাত্মক বা অস্পষ্ট ট্রিগার।</div>
            </div>
          </div>

          {/* B. Trade Management */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                B. Trade Management
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                MFE Peak
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              ট্রেড নেওয়ার পর প্রাইস অনুকূলে সর্বোচ্চ কত দূর গিয়েছিল তা রেকর্ড করুন:
            </p>
            <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-slate-800 dark:text-slate-200 flex-wrap pt-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">+0.5R</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">+1R</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">+1.5R</span>
              <span>→</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">+2R+</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              এর মাধ্যমে বোঝা যায় সেটআপটি আদৌ মোমেন্টাম পেয়েছিল কি না।
            </p>
          </div>

          {/* C. Why did it lose? */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                C. Why did it lose?
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                Loss Reason
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Loss হলে সঠিক রুট-কজ ক্যাটাগরি নির্বাচন করুন:
            </p>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-700 dark:text-slate-300 font-mono">
              <span>• Wrong H1 bias</span>
              <span>• Wrong key level</span>
              <span>• False MSS</span>
              <span>• Weak pullback</span>
              <span>• False trigger</span>
              <span>• Opposing zone</span>
              <span>• SL too tight</span>
              <span>• Normal loss</span>
            </div>
          </div>
        </div>
      </div>

      {/* Golden Rule: Never Alter Decision Mid-Trade */}
      <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wider font-mono">
            সবচেয়ে গুরুত্বপূর্ণ শৃঙ্খলা: Entry-এর পরে চার্ট দেখে নিজের Decision বদলাবেন না
          </h3>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          ট্রেড এক্সেকিউট করার পর সাধারণ ট্রেডাররা মানসিক চাপ ও আবেগের বশে নিয়ম লঙ্ঘন করে, যেমন:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 text-slate-800 dark:text-slate-200">
            <span className="text-rose-600 dark:text-rose-400 font-bold block mb-0.5 font-mono">✕ ভুল আচরণ ১:</span>
            &ldquo;+1R গেছে, এখন ভয়ে SL সরিয়ে ব্রেকইভেনে বা অন্য কোথাও নিই।&rdquo;
          </div>
          <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 text-slate-800 dark:text-slate-200">
            <span className="text-rose-600 dark:text-rose-400 font-bold block mb-0.5 font-mono">✕ ভুল আচরণ ২:</span>
            &ldquo;মনে হচ্ছে মার্কেট আরও উঠবে, লোভে পড়ে নির্ধারিত TP বাড়িয়ে দিই।&rdquo;
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-950 dark:text-amber-200 text-xs font-semibold">
          ★ প্রতিটি ট্রেডে শতভাগ ফিক্সড রুলস (Fixed Rules) বজায় রাখুন। না হলে আমরা বুঝতেই পারব না LSE ও DRE সিস্টেম আসলে বাস্তবে কী পারফর্ম করছে।
        </div>
      </div>

      {/* Trade Journal Core Schema Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              আপনার ব্যাকটেস্ট জার্নালের মূল ডাটা কাঠামো (JSON Data Structure)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Clean LSE &amp; DRE Specification
          </span>
        </div>
        
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          আপনার সংরক্ষিত প্রতিটি ট্রেডের JSON এবং CSV ফাইলে অন্তত এই মূল ডাটা স্বয়ংক্রিয়ভাবে সংরক্ষিত ও রপ্তানি করা হচ্ছে, যাতে কেবল &ldquo;কতগুলো উইন&rdquo; নয়—বরং <strong>কোথায় স্ট্র্যাটেজি বা শৃঙ্খলা ভেঙে যাচ্ছে</strong> তা যেকোনো সময় স্পষ্টভাবে খুঁজে বের করা যায়:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs font-mono">
          {[
            { num: '১', title: 'Strategy', desc: 'LSE / DRE' },
            { num: '২', title: 'H1 Bias', desc: 'Bullish / Bearish / Unclear' },
            { num: '৩', title: 'Key Level', desc: 'Demand / Supply / Support' },
            { num: '৪', title: 'Liquidity Event', desc: 'Sweep + Reversal / Reaction' },
            { num: '৫', title: '15M Trigger', desc: 'Rejection / Engulfing' },
            { num: '৬', title: 'M5 Pullback', desc: 'Healthy / Weak' },
            { num: '৭', title: 'Entry Price', desc: 'Exact Execution' },
            { num: '৮', title: 'Stop Loss', desc: 'Structural SL' },
            { num: '৯', title: 'Take Profit', desc: 'Target Price' },
            { num: '১০', title: 'Planned RR', desc: 'Min 1:2.00 RR' },
            { num: '১১', title: 'MFE Peak', desc: 'Max R Reached Peak' },
            { num: '১২', title: 'Result', desc: 'Win / Loss / BE' },
            { num: '১৩', title: 'Result in R', desc: 'Realized Net R (+2.5R/-1R)' },
            { num: '১৪', title: 'Rule Followed?', desc: 'Fixed Rules Kept (Yes/No)' },
            { num: '১৫', title: 'Loss Reason', desc: 'Root Cause Category' },
          ].map((field) => (
            <div
              key={field.num}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] text-amber-500 font-bold block mb-0.5">#{field.num}</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs block truncate">{field.title}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block truncate">
                {field.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Risk Management Rules */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-500 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            স্থির রিস্ক ম্যানেজমেন্ট ও এক্সিকিউশন রুলস
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block font-mono text-xs sm:text-[13px]">
              রুল ১: সর্বনিম্ন ১:২ প্ল্যানড রিস্ক-টু-রিওয়ার্ড
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              পরবর্তী যৌক্তিক স্ট্রাকচারাল টার্গেটে যদি স্টপ লস অনুযায়ী কমপক্ষে ১:২ রিস্ক-টু-রিওয়ার্ড (Planned RR 1:2.00) না পাওয়া যায়, তবে সেই ট্রেডটি অবশ্যই বাদ দিতে হবে।
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-blue-600 dark:text-blue-400 block font-mono text-xs sm:text-[13px]">
              রুল ২: স্ট্রাকচারাল ইনভ্যালিডেশন স্টপ লস
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              স্টপ লস সবসময় স্ট্রাকচারাল ইনভ্যালিডেশন লেভেলের বাইরে রাখতে হবে (BUY-এর জন্য সুইং লো-এর নিচে, SELL-এর জন্য সুইং হাই-এর ওপরে)। কোনো অবস্থাতেই মনগড়া ফিক্সড-পিপ SL দেওয়া যাবে না।
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-purple-600 dark:text-purple-400 block font-mono text-xs sm:text-[13px]">
              রুল ৩: কোনো বাহ্যিক ইন্ডিকেটর ব্যবহার নয়
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              চার্টে RSI, MACD, মুভিং এভারেজ বা অন্য কোনো বাহ্যিক ইন্ডিকেটর যোগ করবেন না। এই ব্যাকটেস্টিং নিখুঁত প্রাইস অ্যাকশন ও LSE/DRE স্ট্রাকচারের আসল পরিসংখ্যানগত সক্ষমতা যাচাইয়ের জন্য।
            </p>
          </div>
        </div>
      </div>

      {/* Philosophy: Why "No Trade" is a Positive Event */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            ব্যাকটেস্টিং দর্শন: "নো ট্রেড (No Trade)" একটি ইতিবাচক ও সফল সিদ্ধান্ত
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          "No Trade" বা "Incomplete Setup"-কে কখনোই ব্যর্থতা বা লোকসান ভাববেন না। একটি লাভজনক ট্রেডিং সিস্টেমের মূল শক্তি হলো প্রতিকূল, অনিশ্চিত বা চপি মার্কেট ফিল্টার করে অপ্রয়োজনীয় ক্ষতি রোধ করা। যখন H1 মার্কেট বায়াস অস্পষ্ট থাকে কিংবা লিকুইডিটি কনফার্মেশন না পেয়ে আপনি কোনো ট্রেড না নিয়ে নিখুঁতভাবে "No Trade" রেকর্ড করেন—তা আপনার সিস্টেমের সর্বোচ্চ শৃঙ্খলা, নিয়ন্ত্রণ এবং পেশাদারিত্ব প্রমাণ করে।
        </p>
      </div>
    </div>
  );
};
