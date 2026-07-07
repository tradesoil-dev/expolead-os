"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Users,
  FileText,
  FlaskConical,
  UserPlus,
  Package,
  CalendarCheck,
  BarChart3,
  Store,
} from "lucide-react";
import SplashScreen from "@/components/SplashScreen";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const MARQUEE_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type MarqueeShow = { mon: string; day: string; year: string; name: string; loc: string; sector: string };

function toMarqueeCard(ex: { name: string; location: string | null; start_date: string | null; end_date: string | null; sector: string | null }): MarqueeShow | null {
  if (!ex.start_date) return null;
  const s = new Date(ex.start_date);
  const e = ex.end_date ? new Date(ex.end_date) : s;
  return {
    mon: MARQUEE_MONTHS[s.getUTCMonth()],
    day: `${s.getUTCDate()}–${e.getUTCDate()}`,
    year: String(e.getUTCFullYear()),
    name: ex.name,
    loc: ex.location ?? "",
    sector: ex.sector ?? "",
  };
}

const translations = {
  en: {
    nav: { pricing: "Pricing", login: "Log in", trial: "Start free trial" },
    hero: {
      badge: "Exhibition Lead Management",
      h1a: "Turn Expo Conversations",
      h1b: "Into Revenue",
      sub: "Capture booth visits, buyer signals, samples, quotations and follow-ups in one workspace built for exhibitors, sourcing teams and international trade professionals.",
      checks: [
        "Capture buyer intent and qualification signals instantly",
        "Manage samples, quotations and follow-ups in one place",
        "Never lose opportunities after an exhibition ends",
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
    expoStrip: {
      label: "Built for the world's leading trade exhibitions",
      shows: ["ANUGA", "SIAL CHINA", "CHINACOAT", "ICIF", "CANTON FAIR", "GULFOOD"],
    },
    testimonials: {
      label: "What early users say",
      title: "Trusted by trade professionals",
      items: [] as { quote: string; initials: string; name: string; role: string }[],
    },
    pricingAnchor: {
      label: "Simple, honest pricing",
      priceLead: "Plans from",
      price: "$15",
      priceTail: "/month",
      sub: "Billed annually — or $19/month. One recovered lead pays for ExpoLead OS for years. 14-day free trial, no credit card.",
      cta: "Start free trial",
      secondary: "See full pricing",
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
          desc: "You worked the booth for three days and came home with 80 cards. Two weeks later, half are cold. Capture every lead the moment you meet them, so none go stale.",
        },
        {
          title: "Sourcing teams",
          desc: "Ten halls, forty suppliers, one blurred notebook of booth numbers. Log each supplier, product, and quantity on the floor, not on the flight home.",
        },
        {
          title: "International traders",
          desc: "Buyers across three time zones, follow-ups slipping through the cracks. Keep every conversation, sample, and next step in one place, ready when they reply.",
        },
      ],
    },
    growth: "Driving revenue growth",
    features: {
      label: "Everything in one workspace",
      title: "Everything you need to turn booth conversations into orders",
      items: [
        { title: "Capture at the booth", desc: "Log every connection, contact and product the moment you meet.", icon: "user" },
        { title: "Products & quantity", desc: "Track what they deal in and the quantities discussed, not just names.", icon: "package" },
        { title: "Follow-ups that don't slip", desc: "Due-date reminders and at-risk flags so no lead goes cold.", icon: "calendar" },
        { title: "Opportunity pipeline", desc: "Move conversations from qualified to won across a clear board.", icon: "chart" },
        { title: "Exhibition library", desc: "Your shows pre-loaded with correct dates and venues, ready day one.", icon: "store" },
      ],
    },
    upcoming: {
      label: "Plan your year",
      title: "The shows you attend, ready on day one",
      sub: "ExpoLead OS comes pre-loaded with major trade exhibitions — correct dates and venues already filled in.",
      cta: "Browse upcoming shows",
    },
    security: {
      label: "Security & trust",
      title: "Security, control and your data",
      intro: "We take data privacy and security as seriously as you do. ExpoLead OS is designed around three principles:",
      principles: [
        { title: "Isolation & privacy", desc: "Your connections, leads and notes are strictly private. No other user on ExpoLead OS can ever access your records." },
        { title: "Encryption & secure auth", desc: "All data is protected with HTTPS/TLS in transit and stored securely via Supabase, the same infrastructure used by thousands of production apps." },
        { title: "You own your data", desc: "We never sell or share your business data with third parties. Export everything as CSV and leave anytime. No lock-in." },
      ],
      footer: "Built on Supabase with row-level security enforced at the database level.",
      badge: "Your data is protected",
    },
    founder: {
      label: "A note from the founders",
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
        "即时捕捉买家意向和资质信号",
        "在一处管理样品、报价和跟进",
        "展会结束后不再错失任何商机",
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
    expoStrip: {
      label: "专为全球领先的贸易展会打造",
      shows: ["ANUGA", "SIAL CHINA", "CHINACOAT", "ICIF", "CANTON FAIR", "GULFOOD"],
    },
    testimonials: {
      label: "早期用户评价",
      title: "深受贸易专业人士信赖",
      items: [] as { quote: string; initials: string; name: string; role: string }[],
    },
    pricingAnchor: {
      label: "简单、透明的定价",
      priceLead: "套餐低至",
      price: "$15",
      priceTail: "/月",
      sub: "按年计费 — 或每月 $19。挽回一条线索即可让 ExpoLead OS 物超所值多年。14 天免费试用，无需信用卡。",
      cta: "免费试用",
      secondary: "查看完整定价",
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
          desc: "您在展台忙了三天，带回80张名片。两周后，一半线索已经变冷。在见到对方的那一刻就记录每条线索，让它们不再流失。",
        },
        {
          title: "采购团队",
          desc: "十个展馆，四十家供应商，一本写满展位号却看不懂的笔记。在现场记下每家供应商、产品和数量，而不是等到回程的飞机上。",
        },
        {
          title: "国际贸易商",
          desc: "买家分布在三个时区，跟进总在缝隙中漏掉。把每次对话、样品和下一步都集中在一处，对方回复时随时可用。",
        },
      ],
    },
    growth: "驱动营收增长",
    features: {
      label: "一体化工作空间",
      title: "将展台对话变成订单所需的一切",
      items: [
        { title: "展台现场捕捉", desc: "在见面的那一刻记录每个联系人、联系方式和产品。", icon: "user" },
        { title: "产品与数量", desc: "记录他们经营的产品和洽谈的数量，而不只是名字。", icon: "package" },
        { title: "不漏掉的跟进", desc: "到期提醒和风险标记，让每条线索都不会变冷。", icon: "calendar" },
        { title: "商机管道", desc: "在清晰的看板上，把对话从合格推进到成交。", icon: "chart" },
        { title: "展会库", desc: "您的展会已预装正确的日期和地点，开通即用。", icon: "store" },
      ],
    },
    upcoming: {
      label: "规划您的全年",
      title: "您参加的展会，开通即用",
      sub: "ExpoLead OS 预装了主要贸易展会，日期和地点已为您填好。",
      cta: "浏览即将举行的展会",
    },
    security: {
      label: "安全与信任",
      title: "安全、控制与您的数据",
      intro: "我们与您一样重视数据隐私和安全。ExpoLead OS围绕三个原则构建：",
      principles: [
        { title: "隔离与隐私", desc: "您的联系人、线索和备注严格私密。ExpoLead OS上的其他用户永远无法访问您的记录。" },
        { title: "加密与安全认证", desc: "所有数据通过HTTPS/TLS加密传输，并通过Supabase安全存储，这是数千个生产应用所使用的基础设施。" },
        { title: "数据归您所有", desc: "我们绝不向第三方出售或共享您的业务数据。随时以CSV格式导出全部数据，随时离开，无锁定。" },
      ],
      footer: "基于Supabase构建，在数据库层面强制执行行级安全。",
      badge: "您的数据受到保护",
    },
    founder: {
      label: "联合创始人寄语",
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

const upcomingShows = [
  { mon: "Sep", day: "3–5", year: "2026", name: "SIAL China", loc: "Guangzhou, China", sector: "Food & Beverage" },
  { mon: "Sep", day: "15–17", year: "2026", name: "ICIF China", loc: "Shanghai, China", sector: "Fertilizer & Agrochem" },
  { mon: "Nov", day: "3–5", year: "2026", name: "Private Label ME", loc: "Dubai, UAE", sector: "Private Label / FMCG" },
  { mon: "Nov", day: "11–13", year: "2026", name: "CHINACOAT", loc: "Guangzhou, China", sector: "Coatings & Chemicals" },
  { mon: "Oct", day: "9–13", year: "2027", name: "Anuga", loc: "Cologne, Germany", sector: "Food & Beverage" },
];

const mockupItems = [
  { items: ["KENP Korea", "Hanwha Bio", "SK Eco"], icon: Users },
  { items: ["UCO China", "Palm Supplier", "Coating Buyer"], icon: ShieldCheck },
  { items: ["Residue FAME", "UCO Spec", "R-POME"], icon: FlaskConical },
  { items: ["500 MT UCO", "FAME Korea", "China Feedstock"], icon: FileText },
];

export default function HomePage() {
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [marqueeShows, setMarqueeShows] = useState<MarqueeShow[]>(upcomingShows);
  const t = translations[lang];

  // Pull the live exhibition library so the marquee reflects what admins add.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    createClient()
      .from("exhibition_library")
      .select("name, location, start_date, end_date, sector")
      .order("start_date", { ascending: true })
      .then(({ data }) => {
        if (data && data.length) {
          const cards = data.map(toMarqueeCard).filter((c): c is MarqueeShow => c !== null);
          if (cards.length) setMarqueeShows(cards);
        }
      });
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <SplashScreen />
      {/* HEADER (sticky) */}
      <div className="sticky top-0 z-50">
      <header className="flex items-center justify-between bg-slate-900 px-4 py-3 shadow-sm shadow-black/20 lg:px-16 lg:py-4">
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
        <div className="md:hidden bg-slate-900 border-t border-slate-700 px-4 py-3 flex flex-col gap-1">
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
      </div>

      {/* HERO */}
      <section
        className="grid min-h-[calc(100vh-96px)] items-center gap-12 px-8 pb-16 pt-10 lg:grid-cols-2 lg:px-16"
        style={{ background: "linear-gradient(115deg, #0f172a 0%, #065f46 48%, #10b981 100%)" }}
      >
        <div className="max-w-3xl">
          <p className="anim-hero-badge mb-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">{t.hero.badge}</p>
          <h1 className="anim-hero-title max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-white md:text-5xl lg:text-4xl">
            {t.hero.h1a}<br />{t.hero.h1b}
          </h1>
          <p className="anim-hero-sub mt-8 max-w-2xl text-xl leading-9 text-white/85">{t.hero.sub}</p>
          <div className="anim-hero-sub mt-8 space-y-5 text-lg text-white/90">
            {t.hero.checks.map((check) => (
              <div key={check} className="flex items-center gap-3">
                <CheckCircle2 className="h-7 w-7 text-emerald-300 shrink-0" />
                <span>{check}</span>
              </div>
            ))}
          </div>
          <div className="anim-hero-btn mt-12 flex flex-col gap-4 sm:flex-row">
            <Link href="/login?mode=signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors">
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

          {/* Phone mockup — bottom left, lead detail view */}
          <div className="absolute -bottom-8 -left-10 w-[140px]" style={{ zIndex: 10 }}>
            <div className="relative bg-slate-950 rounded-[32px] border-[6px] border-slate-950 shadow-2xl overflow-hidden flex flex-col" style={{ height: 280 }}>
              {/* Punch-hole */}
              <div className="bg-slate-900 flex justify-center pt-2 pb-1 shrink-0">
                <div className="w-[8px] h-[8px] rounded-full bg-slate-950" />
              </div>
              {/* Content */}
              <div className="bg-slate-50 flex flex-col gap-[5px] px-2 py-2 flex-1 overflow-hidden">
                {/* Avatar + name */}
                <div className="flex items-center gap-[6px]">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold text-emerald-700">KK</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-900 leading-none">KENP Korea</p>
                    <p className="text-[7px] text-emerald-500 mt-0.5">● High priority</p>
                  </div>
                </div>
                {/* Stage */}
                <div className="bg-white border border-slate-200 rounded-md px-2 py-[5px]">
                  <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400 mb-[2px]">Stage</p>
                  <p className="text-[8px] font-semibold text-slate-800">Qualified</p>
                </div>
                {/* Follow-up */}
                <div className="bg-white border border-slate-200 rounded-md px-2 py-[5px]">
                  <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400 mb-[2px]">Follow-up</p>
                  <p className="text-[8px] font-semibold text-amber-500">Due tomorrow</p>
                </div>
                {/* Notes */}
                <div className="bg-white border border-slate-200 rounded-md px-2 py-[5px]">
                  <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400 mb-[2px]">Notes</p>
                  <p className="text-[7px] text-slate-600 leading-[1.4]">Interested in 500MT UCO. Send spec sheet.</p>
                </div>
                {/* CTA */}
                <div className="bg-emerald-600 rounded-md px-2 py-[6px] text-center mt-auto">
                  <p className="text-[8px] font-bold text-white">Mark followed up ✓</p>
                </div>
              </div>
              {/* Home bar */}
              <div className="bg-slate-50 flex justify-center py-[5px] shrink-0">
                <div className="w-9 h-[3px] rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE PRODUCT MOCKUP — phone only, so mobile visitors see the product */}
        <div className="mt-4 flex justify-center lg:hidden">
          <div className="w-[220px] rounded-[28px] border-[7px] border-slate-950 bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 flex justify-center pt-2 pb-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
            </div>
            <div className="bg-slate-50 flex flex-col gap-2 px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-700">KK</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-none">KENP Korea</p>
                  <p className="text-[9px] text-emerald-500 mt-1">● High priority</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Stage</p>
                <p className="text-[11px] font-semibold text-slate-800">Qualified</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Follow-up</p>
                <p className="text-[11px] font-semibold text-amber-500">Due tomorrow</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Notes</p>
                <p className="text-[10px] text-slate-600 leading-snug">Interested in 500MT UCO. Send spec sheet.</p>
              </div>
              <div className="bg-emerald-600 rounded-lg px-3 py-2 text-center">
                <p className="text-[11px] font-bold text-white">Mark followed up ✓</p>
              </div>
            </div>
            <div className="bg-slate-50 flex justify-center py-1.5 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      </section>

      {/* EXHIBITION STRIP — social proof (honest, association-by-design) */}
      <section className="bg-white px-8 py-10 lg:px-16 border-t border-slate-100">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 mb-6">{t.expoStrip.label}</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {t.expoStrip.shows.map((show) => (
              <Link
                key={show}
                href="/trade-shows"
                className="rounded-full bg-slate-100 px-5 py-2 text-sm font-bold tracking-tight text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors md:text-[15px]"
              >
                {show}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — renders only when real quotes exist */}
      {t.testimonials.items.length > 0 && (
        <section className="bg-slate-50 px-8 py-14 lg:px-16 border-t border-slate-100">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-2">{t.testimonials.label}</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{t.testimonials.title}</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {t.testimonials.items.map((item, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex gap-0.5 text-amber-400 mb-3 text-sm">★★★★★</div>
                  <p className="text-sm leading-relaxed text-slate-700 italic mb-5">&ldquo;{item.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">{item.initials}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EXHIBITION REALITY — DONUT CHART */}
      <section className="bg-slate-50 px-8 py-14 lg:px-16 border-t border-slate-100" id="exhibition-reality">
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

      {/* FEATURE STRIP — everything in one workspace */}
      <section className="bg-white px-8 py-20 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">{t.features.label}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{t.features.title}</h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {t.features.items.map((item, i) => {
            const icons: Record<string, typeof UserPlus> = {
              user: UserPlus,
              package: Package,
              calendar: CalendarCheck,
              chart: BarChart3,
              store: Store,
            };
            const Icon = icons[item.icon] ?? UserPlus;
            return (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 mb-3">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-1.5 text-[13px] leading-6 text-slate-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* UPCOMING EXHIBITIONS — scrolling marquee */}
      <section className="bg-white py-14 border-t border-slate-100 overflow-hidden">
        <style>{`
          @keyframes expoScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .expo-track { display: flex; gap: 12px; width: max-content; animation: expoScroll 30s linear infinite; }
          .expo-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="mb-8 px-8 text-center lg:px-16">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">{t.upcoming.label}</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{t.upcoming.title}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{t.upcoming.sub}</p>
        </div>
        <div
          className="relative"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div className="expo-track">
            {[...marqueeShows, ...marqueeShows].map((s, i) => (
              <div key={i} className="w-[180px] shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-1.5 flex items-baseline gap-1.5">
                  <span className="text-[11px] font-bold uppercase text-amber-500">{s.mon}</span>
                  <span className="text-base font-black text-slate-900">{s.day}</span>
                  <span className="text-[11px] text-slate-400">{s.year}</span>
                </div>
                <p className="text-[13px] font-bold text-slate-900">{s.name}</p>
                <p className="mb-2 text-[11px] text-slate-400">{s.loc}</p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">{s.sector}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 px-8 text-center">
          <Link
            href="/trade-shows"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
          >
            {t.upcoming.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* PRICING ANCHOR */}
      <section className="bg-slate-900 px-8 py-16 lg:px-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">{t.pricingAnchor.label}</p>
          <p className="text-3xl font-black tracking-tight text-white md:text-4xl">
            {t.pricingAnchor.priceLead} <span className="text-emerald-400">{t.pricingAnchor.price}</span>{t.pricingAnchor.priceTail}
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">{t.pricingAnchor.sub}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login?mode=signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
              {t.pricingAnchor.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors">
              {t.pricingAnchor.secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section className="bg-white px-8 py-14 lg:px-16 border-t border-slate-100">
        <div className="mx-auto max-w-5xl">
          {/* Centered title */}
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3">{t.security.label}</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl mb-3">{t.security.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">{t.security.intro}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
            {/* Left: numbered principles */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {t.security.principles.map((p, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="text-lg font-black text-emerald-200 shrink-0 w-8 leading-snug">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              ))}
              <p className="text-xs text-slate-400 leading-relaxed pl-12">{t.security.footer}</p>
            </div>

            {/* Right: shield + lock illustration */}
            <div className="shrink-0 w-full lg:w-[220px] flex justify-center">
              <div className="relative w-[220px] h-[240px] rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(145deg, #064e3b, #065f46, #047857)" }}>
                <div className="absolute w-40 h-40 rounded-full" style={{ background: "rgba(16,185,129,0.18)" }} />
                <div className="absolute w-56 h-56 rounded-full" style={{ background: "rgba(16,185,129,0.07)" }} />
                <div className="absolute top-4 right-5 w-1.5 h-1.5 rounded-full bg-emerald-300 opacity-80" />
                <div className="absolute bottom-6 left-5 w-1 h-1 rounded-full bg-emerald-200 opacity-60" />
                <div className="absolute top-12 left-5 w-1 h-1 rounded-full bg-emerald-400 opacity-50" />
                <svg width="140" height="158" viewBox="0 0 140 158" fill="none">
                  <path d="M70 8 L124 30 L124 78 C124 114 100 138 70 152 C40 138 16 114 16 78 L16 30 Z"
                    fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.6)" strokeWidth="2"/>
                  <path d="M70 22 L110 38 L110 78 C110 106 92 126 70 138 C48 126 30 106 30 78 L30 38 Z"
                    fill="rgba(16,185,129,0.10)" stroke="rgba(52,211,153,0.4)" strokeWidth="1.5"/>
                  <rect x="46" y="80" width="48" height="38" rx="8" fill="rgba(16,185,129,0.25)" stroke="#34d399" strokeWidth="2"/>
                  <path d="M56 80 L56 64 C56 54 84 54 84 64 L84 80" fill="none" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round"/>
                  <path d="M60 80 L60 66 C60 59 80 59 80 66 L80 80" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="70" cy="97" r="5" fill="#065f46" stroke="#34d399" strokeWidth="1.5"/>
                  <rect x="68" y="100" width="4" height="7" rx="1" fill="#34d399"/>
                  <line x1="46" y1="93" x2="94" y2="93" stroke="rgba(52,211,153,0.2)" strokeWidth="1"/>
                </svg>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1"
                  style={{ background: "rgba(6,78,59,0.85)", borderColor: "rgba(52,211,153,0.4)" }}>
                  <p className="text-[10px] font-bold text-emerald-300 tracking-wide">{t.security.badge}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section className="bg-slate-800 px-8 py-12 lg:px-16">
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

      {/* FOOTER */}
      <footer className="bg-slate-900 px-8 pt-12 pb-8 lg:px-16">
        {/* Top row: logo + columns */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16 pb-10 border-b border-slate-800">
          {/* Logo + tagline */}
          <div className="shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="grid grid-cols-2 gap-[3px] w-[18px] h-[18px] shrink-0">
                <div className="rounded-[2px] border-[1.5px] border-white" />
                <div className="rounded-[2px] border-[1.5px] border-white" />
                <div className="rounded-[2px] border-[1.5px] border-white" />
                <div className="rounded-[2px] bg-emerald-500" />
              </div>
              <span className="text-[15px] tracking-tight leading-none">
                <span className="font-semibold text-white">Expo</span>
                <span className="font-semibold text-emerald-400">Lead</span>
                <span className="font-normal text-slate-400"> OS</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">{t.footer.tagline}</p>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
            {/* ExpoLead OS */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white mb-4">{t.footerLinks.col1.heading}</p>
              <div className="flex flex-col gap-3">
                <a href="#how-it-works" className="text-sm text-slate-500 hover:text-white transition-colors">
                  {lang === "en" ? "About" : "关于我们"}
                </a>
                <a href="#how-it-works" className="text-sm text-slate-500 hover:text-white transition-colors">
                  {lang === "en" ? "Product Overview" : "产品概览"}
                </a>
              </div>
            </div>

            {/* Resources */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white mb-4">{t.footerLinks.col3.heading}</p>
              <div className="flex flex-col gap-3">
                <a href={`mailto:hello.expolead@tradesoil.com`} className="text-sm text-slate-500 hover:text-white transition-colors">
                  {lang === "en" ? "Help Center" : "帮助中心"}
                </a>
                <a href={`mailto:hello.expolead@tradesoil.com`} className="text-sm text-slate-500 hover:text-white transition-colors">
                  {lang === "en" ? "Support" : "支持"}
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white mb-4">{t.footerLinks.col4.heading}</p>
              <div className="flex flex-col gap-3">
                <a href="https://www.tradesoil.com" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-white transition-colors">
                  {t.footerLinks.col4.tradesoil}
                </a>
                <a href="mailto:hello.expolead@tradesoil.com" className="text-sm text-slate-500 hover:text-white transition-colors">
                  {t.footerLinks.col4.contact}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6">
          <p className="text-xs text-slate-600">© 2026 Tradesoil International. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="text-xs text-slate-500 hover:text-white transition-colors">{t.footer.terms}</Link>
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-white transition-colors">{t.footer.privacy}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
