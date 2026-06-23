"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Users,
  FileText,
  FlaskConical,
} from "lucide-react";
import SplashScreen from "@/components/SplashScreen";

const translations = {
  en: {
    nav: { pricing: "Pricing", login: "Log in", trial: "Start free trial" },
    hero: {
      badge: "Exhibition Lead Management",
      h1a: "Turn Expo Conversations",
      h1b: "Into Revenue",
      sub: "Capture booth visits, buyer signals, samples, quotations and follow-ups in one workspace built for exhibitors, sourcing teams and international trade professionals.",
      checks: [
        "Track every booth visit and business connection",
        "Capture buyer intent and qualification signals instantly",
        "Manage samples, quotations and follow-ups in one place",
        "Never lose opportunities after an exhibition ends",
        "Built for international trade, sourcing and B2B sales teams",
      ],
      cta: "Start free trial",
    },
    mockup: {
      title: "ExpoLead Pipeline",
      live: "Live show",
      columns: ["Prospects", "Qualified", "Samples", "Quotation"],
      leads: "leads",
      followup: "Follow-up required",
      next: "Next best action",
      nextSub: "Send quotation reminder to qualified buyer",
    },
    how: {
      label: "How it works",
      title: "From booth to closed deal, in three steps",
      steps: [
        {
          title: "Capture at the booth",
          desc: "Log connections, buyer signals, booth location and first impressions on the spot — no paper, no chaos.",
        },
        {
          title: "Qualify and pipeline",
          desc: "Score each contact by interest, priority and sample status. Move them through your pipeline while the exhibition is still live.",
        },
        {
          title: "Follow up and close",
          desc: "Scheduled reminders, quotation tracking and opportunity stages keep every deal moving after you leave the show floor.",
        },
      ],
    },
    who: {
      label: "Who it's for",
      title: "Built for the people who work exhibitions",
      cards: [
        {
          title: "Exhibitors",
          desc: "Teams exhibiting at trade shows who need to capture and qualify leads on the show floor.",
        },
        {
          title: "Sourcing teams",
          desc: "Buyers and procurement professionals visiting exhibitions to find new connections and products.",
        },
        {
          title: "International traders",
          desc: "B2B sales and trade professionals managing cross-border connections and buyer relationships.",
        },
      ],
    },
    growth: "Driving revenue growth",
    security: {
      label: "Security & trust",
      title: "Your data is safe with us",
      items: [
        { title: "Data isolation", desc: "Your data is strictly isolated. No other user can ever access your records." },
        { title: "Encrypted in transit", desc: "All data is protected with HTTPS/TLS encryption between your browser and our servers." },
        { title: "Secure authentication", desc: "Powered by Supabase, industry-standard auth used by thousands of production apps." },
        { title: "No data sharing", desc: "We never sell or share your business data. Your connections stay yours, always." },
      ],
    },
    founder: {
      label: "A note from the founder",
      quote: "ExpoLead OS was built by someone who has worked in international trade, understands the exhibition floor, and believes that serious professionals deserve serious tools. This is not a generic CRM adapted for exhibitions, it was designed specifically for the way trade professionals work, on the floor, across borders, under time pressure. Built with conviction. Designed for results.",
      name: "Gladwin Gerald",
      title: "Founder, ExpoLead OS · Tradesoil International",
    },
    footerLinks: {
      col1: { heading: "ExpoLead OS", items: ["About", "Product Overview", "Exhibitions", "Trade Show Teams"] },
      col2: { heading: "Use Cases", items: ["Lead Capture", "Buyer Qualification", "Sample Tracking", "Quotation Follow-ups"] },
      col3: { heading: "Resources", items: ["Help Center", "Product Guide", "Best Practices", "Support"] },
      col4: { heading: "Company", tradesoil: "Tradesoil", contact: "Contact" },
    },
    footer: {
      lang: "English (US)",
      terms: "Terms of Service",
      privacy: "Privacy Notice",
      tagline: "Built for exhibitions. Designed for revenue growth.",
    },
  },
  zh: {
    nav: { pricing: "定价", login: "登录", trial: "免费试用" },
    hero: {
      badge: "展会线索管理",
      h1a: "将展会对话",
      h1b: "转化为收入",
      sub: "在一个专为参展商、采购团队和国际贸易专业人士打造的工作空间中，捕捉展位访客、买家意向、样品、报价和跟进事项。",
      checks: [
        "追踪每一次展位访问和商业联系",
        "即时捕捉买家意向和资质信号",
        "在一处管理样品、报价和跟进",
        "展会结束后不再错失任何商机",
        "专为国际贸易、采购和B2B销售团队打造",
      ],
      cta: "免费试用",
    },
    mockup: {
      title: "ExpoLead 管道",
      live: "展会进行中",
      columns: ["潜在客户", "已资质评估", "样品", "报价"],
      leads: "条线索",
      followup: "需要跟进",
      next: "下一步最佳行动",
      nextSub: "向已资质买家发送报价提醒",
    },
    how: {
      label: "工作原理",
      title: "从展台到成交，三步完成",
      steps: [
        {
          title: "在展台捕捉信息",
          desc: "现场记录联系人、买家信号、展位位置和第一印象——无需纸张，告别混乱。",
        },
        {
          title: "资质评估与管道管理",
          desc: "按兴趣、优先级和样品状态对每位联系人评分，在展会进行期间即可推进管道流程。",
        },
        {
          title: "跟进与成交",
          desc: "定时提醒、报价追踪和商机阶段管理，让每笔交易在离开展会后持续推进。",
        },
      ],
    },
    who: {
      label: "适合人群",
      title: "专为展会工作者打造",
      cards: [
        {
          title: "参展商",
          desc: "在贸易展上参展的团队，需要在展台现场捕捉和筛选线索。",
        },
        {
          title: "采购团队",
          desc: "参观展会寻找新联系人和产品的买家及采购专业人士。",
        },
        {
          title: "国际贸易商",
          desc: "管理跨境联系和买家关系的B2B销售及贸易专业人士。",
        },
      ],
    },
    growth: "驱动营收增长",
    security: {
      label: "安全与信任",
      title: "您的数据安全有保障",
      items: [
        { title: "数据隔离", desc: "您的数据严格隔离。其他用户永远无法访问您的记录。" },
        { title: "传输加密", desc: "所有数据通过HTTPS/TLS加密在您的浏览器和服务器之间传输。" },
        { title: "安全认证", desc: "由Supabase提供支持，这是数千个生产应用所使用的行业标准认证方案。" },
        { title: "不共享数据", desc: "我们绝不出售或共享您的业务数据。您的联系人始终属于您自己。" },
      ],
    },
    founder: {
      label: "创始人寄语",
      quote: "ExpoLead OS由一位深耕国际贸易、了解展会现场的人创建，他相信专业人士值得拥有专业工具。这不是一个为展会改造的通用CRM——它专为贸易专业人士的工作方式而设计：在展台上、跨越国界、在时间压力下。以信念打造，为成果而生。",
      name: "Gladwin Gerald",
      title: "创始人，ExpoLead OS · Tradesoil International",
    },
    footerLinks: {
      col1: { heading: "ExpoLead OS", items: ["关于我们", "产品概览", "展会", "展会团队"] },
      col2: { heading: "使用场景", items: ["线索捕捉", "买家资质评估", "样品追踪", "报价跟进"] },
      col3: { heading: "资源", items: ["帮助中心", "产品指南", "最佳实践", "支持"] },
      col4: { heading: "公司", tradesoil: "Tradesoil", contact: "联系我们" },
    },
    footer: {
      lang: "中文（简体）",
      terms: "服务条款",
      privacy: "隐私声明",
      tagline: "专为展会打造，致力于营收增长。",
    },
  },
};

const mockupItems = [
  { items: ["KENP Korea", "Hanwha Bio", "SK Eco"], icon: Users },
  { items: ["UCO China", "Palm Supplier", "Coating Buyer"], icon: ShieldCheck },
  { items: ["Residue FAME", "UCO Spec", "R-POME"], icon: FlaskConical },
  { items: ["500 MT UCO", "FAME Korea", "China Feedstock"], icon: FileText },
];

export default function HomePage() {
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const t = translations[lang];

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 text-slate-950">
      <SplashScreen />
      {/* HEADER */}
      <header className="flex items-center justify-between bg-slate-800 px-4 py-3 lg:px-16 lg:py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid grid-cols-2 gap-[3.5px] shrink-0">
            <div className="logo-sq1 w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="logo-sq2 w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="logo-sq3 w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="logo-sq4 w-[10px] h-[10px] rounded-[2px] bg-emerald-500" />
          </div>
          <span className="flex items-center text-[16px] tracking-tight leading-none">
            <span className="font-semibold text-white">Expo</span><span className="font-semibold text-emerald-400">Lead</span><span className="font-normal text-slate-400"> OS</span>
          </span>
        </div>

        <div className="anim-nav-links flex items-center gap-3">
          {/* Desktop nav */}
          <Link href="/pricing" className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition-colors">
            {t.nav.pricing}
          </Link>
          <Link href="/login" className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition-colors">
            {t.nav.login}
          </Link>
          <Link href="/login?mode=signup" className="hidden md:block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shrink-0">
            {t.nav.trial}
          </Link>

          {/* Language toggle — always visible */}
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            className="flex items-center gap-1 rounded-md border border-slate-600 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-400 hover:text-white transition-colors shrink-0"
          >
            <Globe2 className="h-3 w-3" />
            {lang === "en" ? "中文" : "EN"}
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-[5px] p-1.5 shrink-0"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-slate-300 transition-all ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-300 transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-300 transition-all ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 px-4 py-3 flex flex-col gap-1">
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            {t.nav.pricing}
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            {t.nav.login}
          </Link>
          <Link href="/login?mode=signup" onClick={() => setMenuOpen(false)} className="mt-1 block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
            {t.nav.trial}
          </Link>
        </div>
      )}

      {/* HERO */}
      <section className="grid min-h-[calc(100vh-96px)] items-center gap-12 px-8 pb-16 pt-10 lg:grid-cols-2 lg:px-16">
        <div className="max-w-3xl">
          <p className="anim-hero-badge mb-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">{t.hero.badge}</p>
          <h1 className="anim-hero-title max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-slate-900 md:text-5xl lg:text-4xl">
            {t.hero.h1a}<br />{t.hero.h1b}
          </h1>
          <p className="anim-hero-sub mt-8 max-w-2xl text-xl leading-9 text-slate-700">{t.hero.sub}</p>
          <div className="anim-hero-sub mt-8 space-y-5 text-lg text-slate-700">
            {t.hero.checks.map((check) => (
              <div key={check} className="flex items-center gap-3">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" />
                <span>{check}</span>
              </div>
            ))}
          </div>
          <div className="anim-hero-btn mt-12 flex flex-col gap-4 sm:flex-row">
            <Link href="/login?mode=signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
              {t.hero.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* RIGHT PRODUCT MOCKUP */}
        <div className="relative hidden lg:block">
          <style>{`
            @keyframes growUp {
              0%   { transform: scaleY(0); opacity: 0; }
              60%  { transform: scaleY(1); opacity: 1; }
              80%  { transform: scaleY(1); opacity: 1; }
              95%  { transform: scaleY(0); opacity: 0; }
              100% { transform: scaleY(0); opacity: 0; }
            }
            .bar { transform-origin: bottom; animation: growUp 2.4s cubic-bezier(0.34,1.56,0.64,1) infinite; }
          `}</style>
          <div className="absolute -left-10 top-10 h-32 w-44 rounded-2xl bg-white p-4 shadow-xl">
            <p className="text-xs font-semibold text-slate-500">Lead Quality</p>
            <div className="mt-4 flex items-end gap-3">
              <div className="bar h-16 w-8 rounded-t-lg bg-emerald-300" style={{ animationDelay: "0.1s" }} />
              <div className="bar h-24 w-8 rounded-t-lg bg-emerald-500" style={{ animationDelay: "0.25s" }} />
              <div className="bar h-20 w-8 rounded-t-lg bg-slate-700" style={{ animationDelay: "0.4s" }} />
              <div className="bar h-28 w-8 rounded-t-lg bg-emerald-700" style={{ animationDelay: "0.55s" }} />
            </div>
          </div>
          <div className="rounded-[2rem] border-[10px] border-slate-950 bg-white shadow-2xl shadow-emerald-900/20">
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900">{t.mockup.title}</p>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{t.mockup.live}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 p-5">
              {mockupItems.map((col, i) => {
                const Icon = col.icon;
                return (
                  <div key={i} className="min-h-[360px] rounded-2xl bg-slate-50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{t.mockup.columns[i]}</p>
                        <p className="text-xs text-slate-500">{col.items.length} {t.mockup.leads}</p>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {col.items.map((item) => (
                        <div key={item} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                          <p className="text-sm font-semibold text-slate-800">{item}</p>
                          <p className="mt-1 text-xs text-slate-500">{t.mockup.followup}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="absolute bottom-8 right-8 rounded-2xl bg-white p-5 shadow-xl">
            <p className="text-sm font-bold text-slate-800">{t.mockup.next}</p>
            <p className="mt-1 text-xs text-slate-500">{t.mockup.nextSub}</p>
          </div>

          {/* Phone mockup — bottom right */}
          <div className="absolute bottom-0 -right-6 w-[115px]" style={{ zIndex: 10 }}>
            <div className="relative rounded-[24px] border-[5px] border-slate-950 bg-slate-950 shadow-2xl overflow-hidden">
              {/* Screen with punch-hole camera */}
              <div className="relative bg-slate-800">
                {/* Punch-hole dot */}
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-2 h-2 rounded-full bg-slate-950" />
                </div>
                {/* Nav bar */}
                <div className="bg-slate-800 px-2 py-1.5 flex items-center justify-between">
                  <div className="grid grid-cols-2 gap-[2px] w-[11px] h-[11px] shrink-0">
                    <div className="rounded-[1.5px] border-[1.2px] border-white" />
                    <div className="rounded-[1.5px] border-[1.2px] border-white" />
                    <div className="rounded-[1.5px] border-[1.2px] border-white" />
                    <div className="rounded-[1.5px] bg-emerald-500" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="rounded border border-slate-600 px-1 py-0.5">
                      <span className="text-[6px] font-semibold text-slate-300">中文</span>
                    </div>
                    <div className="flex flex-col gap-[3px]">
                      <div className="w-[9px] h-[1.2px] bg-slate-400 rounded" />
                      <div className="w-[9px] h-[1.2px] bg-slate-400 rounded" />
                      <div className="w-[9px] h-[1.2px] bg-slate-400 rounded" />
                    </div>
                  </div>
                </div>
              </div>
              {/* App content */}
              <div className="bg-slate-50 px-2 py-2">
                <p className="text-[7px] font-bold text-slate-800 mb-1.5">Connections</p>
                {[
                  { name: "KENP Korea", label: "High priority", color: "#10b981" },
                  { name: "UCO China", label: "Follow up", color: "#f59e0b" },
                  { name: "Hanwha Bio", label: "New", color: "#94a3b8" },
                ].map((item) => (
                  <div key={item.name} className="bg-white border border-slate-100 rounded-[5px] px-1.5 py-1 mb-1">
                    <p className="text-[7px] font-semibold text-slate-800">{item.name}</p>
                    <p className="text-[6px]" style={{ color: item.color }}>{item.label}</p>
                  </div>
                ))}
              </div>
              {/* Home bar */}
              <div className="flex justify-center py-1.5 bg-slate-50">
                <div className="w-8 h-[3px] rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXHIBITION REALITY — DONUT CHART */}
      <section className="bg-slate-50 px-8 py-14 lg:px-16 border-t border-slate-100">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 mb-2">
              {lang === "en" ? "The exhibition reality" : "展会现实"}
            </p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              {lang === "en"
                ? "What happens to your connections and leads after the show ends?"
                : "展会结束后，您的联系人和线索去哪了？"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {lang === "en"
                ? "Based on industry research across trade show professionals"
                : "基于展会专业人士的行业研究"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* Donut chart */}
            <div className="relative shrink-0" style={{ width: 220, height: 220 }}>
              <canvas id="reality-donut" width={220} height={220} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-red-400 leading-none">70%</span>
                <span className="text-xs text-slate-400 mt-1">{lang === "en" ? "never" : "从未"}</span>
                <span className="text-xs text-slate-400">{lang === "en" ? "followed up" : "跟进"}</span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3 flex-1 min-w-[220px] max-w-sm">
              <div className="bg-red-50 border-l-[3px] border-red-400 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-red-800">{lang === "en" ? "Never followed up" : "从未跟进"}</p>
                  <span className="text-xl font-black text-red-400">70%</span>
                </div>
                <p className="mt-1 text-xs text-red-400 leading-relaxed">{lang === "en" ? "Slipped through after the show ended" : "展会结束后流失"}</p>
              </div>
              <div className="bg-amber-50 border-l-[3px] border-amber-400 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-amber-800">{lang === "en" ? "Followed up, went cold" : "跟进后冷却"}</p>
                  <span className="text-xl font-black text-amber-400">20%</span>
                </div>
                <p className="mt-1 text-xs text-amber-500 leading-relaxed">{lang === "en" ? "Too late or lost context from the booth" : "太晚或失去展台背景"}</p>
              </div>
              <div className="bg-emerald-50 border-l-[3px] border-emerald-400 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-emerald-800">{lang === "en" ? "Converted to revenue" : "转化为收入"}</p>
                  <span className="text-xl font-black text-emerald-500">10%</span>
                </div>
                <p className="mt-1 text-xs text-emerald-500 leading-relaxed">{lang === "en" ? "Actually materialised into business" : "真正转化为业务"}</p>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm italic text-slate-500 max-w-lg mx-auto leading-relaxed">
            {lang === "en"
              ? "\"90% of exhibition leads are wasted, not because the leads were bad, but because there was no system.\""
              : "\"90%的展会线索被浪费，不是因为线索质量差，而是因为没有系统。\""}
          </p>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          function drawDonut() {
            var canvas = document.getElementById('reality-donut');
            if (!canvas) { setTimeout(drawDonut, 100); return; }
            var dpr = window.devicePixelRatio || 1;
            var size = 220;
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            canvas.style.width = size + 'px';
            canvas.style.height = size + 'px';
            var ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            var cx = 110, cy = 110, r = 80, thickness = 30;
            var segments = [
              { pct: 0.70, color: '#f87171' },
              { pct: 0.20, color: '#fbbf24' },
              { pct: 0.10, color: '#10b981' },
            ];
            var start = -Math.PI / 2;
            segments.forEach(function(seg) {
              var end = start + seg.pct * 2 * Math.PI;
              ctx.beginPath();
              ctx.arc(cx, cy, r, start, end);
              ctx.lineWidth = thickness;
              ctx.strokeStyle = seg.color;
              ctx.stroke();
              start = end;
            });
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', drawDonut);
          } else {
            drawDonut();
          }
        })();
      ` }} />

      {/* HOW IT WORKS */}
      <section className="bg-white px-8 py-12 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">{t.how.label}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{t.how.title}</h2>
        </div>
        <style>{`
          @keyframes drawLine { 0% { transform: scaleX(0); } 60% { transform: scaleX(1); } 80% { transform: scaleX(1); } 95% { transform: scaleX(0); } 100% { transform: scaleX(0); } }
          .progress-line { transform-origin: left; animation: drawLine 3s ease-in-out infinite; }
        `}</style>
        <div className="relative mx-auto mt-10 grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="absolute hidden md:block" style={{ top: 27, left: "calc(16.67% + 28px)", right: "calc(16.67% + 28px)", height: 2, background: "#d1fae5" }}>
            <div className="progress-line absolute inset-0" style={{ background: "#059669" }} />
          </div>
          {t.how.steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black text-white shadow-lg">{i + 1}</div>
              <h3 className="mt-6 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="bg-slate-50 px-8 py-20 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">{t.who.label}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{t.who.title}</h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {t.who.cards.map((card, i) => {
            const icons = [Users, ShieldCheck, Globe2];
            const Icon = icons[i];
            return (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 mb-4">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-base font-bold text-slate-900">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* GROWTH SECTION */}
      <section className="grid min-h-[300px] bg-white lg:grid-cols-2">
        <div className="min-h-[240px] bg-cover bg-left" style={{ backgroundImage: "url('/growth-meeting.jpg.jpg')" }} />
        <div className="flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-8 py-20 text-center">
          <h2 className="text-4xl font-black leading-[1.05] tracking-tight text-emerald-800 md:text-5xl lg:text-5xl">{t.growth}</h2>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section className="bg-white px-8 py-14 lg:px-16 border-t border-slate-100">
        <div className="mx-auto max-w-4xl text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">{t.security.label}</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">{t.security.title}</h2>
        </div>
        <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-4">
          {t.security.items.map((item, i) => {
            const secIcons = [
              <ShieldCheck key={0} className="h-5 w-5 text-emerald-700" />,
              <svg key={1} className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
              <svg key={2} className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
              <svg key={3} className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 6.343a9 9 0 000 12.728m2.829-2.829a5 5 0 000-7.072" /></svg>,
            ];
            return (
              <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 mx-auto mb-4">{secIcons[i]}</div>
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section className="bg-slate-900 px-8 py-12 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-500 mb-8 text-center">{t.founder.label}</p>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Gladwin */}
            <div className="bg-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-xs font-semibold text-emerald-500 shrink-0">GG</div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.founder.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.founder.title}</p>
                </div>
              </div>
              <p className="text-[13px] leading-[1.8] text-slate-400">
                {lang === "en"
                  ? "ExpoLead OS was built by someone who has worked in international trade, understands the exhibition floor, and believes that serious professionals deserve serious tools. This is not a generic CRM adapted for exhibitions, it was designed specifically for the way trade professionals work, on the floor, across borders, under time pressure."
                  : "ExpoLead OS由一位深耕国际贸易、了解展会现场的人创建。这不是一个为展会改造的通用CRM，它专为贸易专业人士的工作方式而设计。"}
              </p>
            </div>

            {/* Gayan */}
            <div className="bg-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-xs font-semibold text-emerald-500 shrink-0">GD</div>
                <div>
                  <p className="text-sm font-semibold text-white">Gayan Dias</p>
                  <p className="text-xs text-slate-500 mt-0.5">{lang === "en" ? "Co-Founder, ExpoLead OS · Strategic Adviser" : "联合创始人，ExpoLead OS · 战略顾问"}</p>
                </div>
              </div>
              <p className="text-[13px] leading-[1.8] text-slate-400">
                {lang === "en"
                  ? "Gayan Dias is the strategic mind behind ExpoLead OS's business model. A business analyst and strategic adviser by background, Gayan ensures that every product decision is grounded in commercial reality, from how we price, to how we grow, to who we serve."
                  : "Gayan Dias 是 ExpoLead OS 商业模式背后的战略智囊。作为商业分析师和战略顾问，他确保每一个产品决策都立足于商业现实，从定价到增长，再到目标用户。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER LINKS */}
      <section className="border-t border-emerald-900/10 bg-white px-8 py-12 lg:px-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-bold text-slate-950">{t.footerLinks.col1.heading}</h3>
            <div className="space-y-3 text-sm text-slate-600">{t.footerLinks.col1.items.map((item) => <p key={item}>{item}</p>)}</div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-slate-950">{t.footerLinks.col2.heading}</h3>
            <div className="space-y-3 text-sm text-slate-600">{t.footerLinks.col2.items.map((item) => <p key={item}>{item}</p>)}</div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-slate-950">{t.footerLinks.col3.heading}</h3>
            <div className="space-y-3 text-sm text-slate-600">{t.footerLinks.col3.items.map((item) => <p key={item}>{item}</p>)}</div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-slate-950">{t.footerLinks.col4.heading}</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <a href="https://www.tradesoil.com" target="_blank" rel="noreferrer" className="hover:underline block">{t.footerLinks.col4.tradesoil}</a>
              <p>{t.footerLinks.col4.contact}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-emerald-900/10 bg-white px-8 py-10 lg:px-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Globe2 className="h-5 w-5" />
              {t.footer.lang}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <span>© 2026 ExpoLead OS</span>
              <span>|</span>
              <Link href="/terms" className="hover:text-emerald-700">{t.footer.terms}</Link>
              <span>|</span>
              <Link href="/privacy" className="hover:text-emerald-700">{t.footer.privacy}</Link>
            </div>
          </div>
          <div className="flex flex-col gap-5 lg:items-end">
            <div className="flex items-center gap-4 text-slate-500">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">f</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">IG</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">X</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">in</span>
            </div>
            <p className="text-sm text-slate-700">{t.footer.tagline}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
