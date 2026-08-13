const pptxgen = require('pptxgenjs');
const path = require('path');

const OUT = path.join(__dirname, 'ExpoLead-Investor-Deck.pptx');

// ---- palette (matches CRM positioning v3) ----
const C = {
  navy:'0F172A', slate800:'1E293B', slate700:'334155', slate600:'475569',
  slate500:'64748B', slate400:'94A3B8', slate300:'CBD5E1', slate200:'E2E8F0',
  slate100:'F1F5F9', slate50:'F8FAFC',
  em700:'047857', em600:'059669', em500:'10B981', em400:'34D399',
  em100:'D1FAE5', em50:'ECFDF5',
  amber:'F59E0B', amber50:'FFFBEB', amberBd:'FDE68A', amberTx:'7C5B16',
  white:'FFFFFF',
};
const FB = 'Calibri';
const FH = 'Calibri';

const p = new pptxgen();
p.defineLayout({ name:'W', width:13.333, height:7.5 });
p.layout = 'W';
const PW = 13.333, PH = 7.5, M = 0.55;

// ---------- helpers ----------
function logo(s, x, y, dark){
  const sz = 0.11, g = 0.045;
  const outline = dark ? C.white : C.navy;
  const cells = [[0,0,false],[1,0,false],[0,1,false],[1,1,true]];
  cells.forEach(([cx,cy,fill])=>{
    s.addShape(p.ShapeType.roundRect, {
      x:x+cx*(sz+g), y:y+cy*(sz+g), w:sz, h:sz, rectRadius:0.02,
      fill: fill?{color:C.em500}:{color: dark?C.navy:C.white},
      line:{color: fill?C.em500:outline, width:1.3},
    });
  });
  s.addText(
    [{text:'Expo',options:{color: dark?C.white:C.navy, bold:true}},
     {text:'Lead',options:{color:C.em500, bold:true}},
     {text:' OS',options:{color:C.slate400}}],
    {x:x+0.42, y:y-0.05, w:2.2, h:0.36, fontFace:FH, fontSize:15, align:'left', valign:'middle', margin:0}
  );
}
function eyebrow(s, x, y, text, color){
  s.addText(text.toUpperCase(), {x, y, w:11, h:0.3, fontFace:FH, fontSize:11, bold:true,
    color: color||C.em600, charSpacing:2.2, align:'left', valign:'middle', margin:0});
}
function pageno(s, n){
  s.addText(String(n), {x:PW-0.8, y:PH-0.5, w:0.4, h:0.3, fontFace:FB, fontSize:10,
    color:C.slate400, align:'right', valign:'middle', margin:0});
}
function footer(s, dark){
  s.addText('ExpoLead OS  ·  Investor briefing  ·  Confidential', {x:M, y:PH-0.5, w:7, h:0.3,
    fontFace:FB, fontSize:9, color: dark?C.slate500:C.slate400, align:'left', valign:'middle', margin:0});
}
function card(s, x, y, w, h, opt){
  opt = opt||{};
  s.addShape(p.ShapeType.roundRect, {x,y,w,h,rectRadius:0.1,
    fill:{color:opt.fill||C.white}, line:{color:opt.line||C.slate200, width:1}});
}
function chip(s, x, y, w, h, text, opt){
  opt = opt||{};
  s.addShape(p.ShapeType.roundRect, {x,y,w,h,rectRadius:0.09,
    fill:{color:opt.fill||C.white}, line:{color:opt.line||C.slate200, width:1}});
  s.addText(text, {x, y, w, h, fontFace:FB, fontSize:opt.fs||10.5, bold:opt.bold!==false,
    color:opt.color||C.slate700, align:opt.align||'center', valign:'middle', margin:opt.margin||0});
}
function fillTag(s, x, y, w){
  // amber "FILL FROM DISCOVERY" marker
  s.addShape(p.ShapeType.roundRect, {x,y,w,h:0.28,rectRadius:0.06,
    fill:{color:C.amber50}, line:{color:C.amberBd, width:1}});
  s.addText('▸ FILL FROM YOUR DISCOVERY TRACKER', {x, y, w, h:0.28, fontFace:FB, fontSize:8.5,
    bold:true, color:C.amberTx, charSpacing:1, align:'center', valign:'middle', margin:0});
}

// ============================================================
// SLIDE 1 — TITLE
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.navy};
  logo(s, M, 0.5, true);
  // emerald accent bar
  s.addShape(p.ShapeType.rect, {x:M, y:2.55, w:0.9, h:0.09, fill:{color:C.em500}, line:{type:'none'}});
  s.addText('Booth conversations,\nturned into revenue.', {x:M, y:2.75, w:11, h:1.9,
    fontFace:FH, fontSize:44, bold:true, color:C.white, align:'left', valign:'top', lineSpacingMultiple:1.0, margin:0});
  s.addText('The exhibition lead workflow that works alongside any CRM — with zero setup.',
    {x:M, y:4.75, w:10.5, h:0.5, fontFace:FB, fontSize:16, color:C.slate300, align:'left', valign:'top', margin:0});
  // footer meta
  s.addText([
    {text:'Gladwin Gerald', options:{color:C.white, bold:true}},
    {text:'  ·  Founder  ·  ExpoLead OS  ·  August 2026', options:{color:C.slate400}},
  ], {x:M, y:6.55, w:11, h:0.35, fontFace:FB, fontSize:12, align:'left', valign:'middle', margin:0});
})();

// ============================================================
// SLIDE 2 — THE PROBLEM (beat 1)
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  eyebrow(s, M, 0.55, 'The problem I discovered');
  s.addText([
    {text:'Exporters go to trade shows, collect a stack of leads — ', options:{color:C.navy}},
    {text:'then almost none get followed up.', options:{color:C.em600}},
  ], {x:M, y:0.95, w:12, h:1.2, fontFace:FH, fontSize:30, bold:true, align:'left', valign:'top', lineSpacingMultiple:1.05, margin:0});

  // the lived story
  card(s, M, 2.5, 12.2, 1.35, {fill:C.slate50, line:C.slate200});
  s.addShape(p.ShapeType.rect, {x:M, y:2.5, w:0.08, h:1.35, fill:{color:C.em500}, line:{type:'none'}});
  s.addText([
    {text:'What I saw firsthand.  ', options:{bold:true, color:C.navy}},
    {text:'An exporter comes home from a show with a booth full of business cards and a phone full of photos. Days pass. The context fades — who wanted what, who was serious. A handful get an email. The rest quietly die in a spreadsheet or a drawer.', options:{color:C.slate700}},
  ], {x:M+0.35, y:2.5, w:11.6, h:1.35, fontFace:FB, fontSize:14, align:'left', valign:'middle', lineSpacingMultiple:1.1, margin:0});

  // three friction facts
  const facts = [
    ['Leads have a shelf life', 'A booth conversation is worth most in the first 72 hours. Manual follow-up almost never happens that fast.'],
    ['The context lives in one head', 'Quantities, samples promised, who to chase — it is remembered, not recorded. When it fades, the lead is dead.'],
    ['It repeats every single show', 'Same exporter, same city, same booths, year after year — with no memory of who they already met.'],
  ];
  const cw = (12.2-2*0.3)/3;
  facts.forEach(([t,b],i)=>{
    const x = M + i*(cw+0.3);
    card(s, x, 4.25, cw, 2.35);
    s.addText(String(i+1), {x:x+0.25, y:4.45, w:0.5, h:0.5, fontFace:FH, fontSize:22, bold:true, color:C.em500, align:'left', valign:'top', margin:0});
    s.addText(t, {x:x+0.25, y:4.95, w:cw-0.5, h:0.6, fontFace:FH, fontSize:14.5, bold:true, color:C.navy, align:'left', valign:'top', margin:0});
    s.addText(b, {x:x+0.25, y:5.5, w:cw-0.5, h:1.0, fontFace:FB, fontSize:11.5, color:C.slate600, align:'left', valign:'top', lineSpacingMultiple:1.08, margin:0});
  });
  footer(s); pageno(s,2);
})();

// ============================================================
// SLIDE 3 — WHY EXISTING TOOLS DON'T SOLVE IT
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  eyebrow(s, M, 0.55, 'Why the obvious tools fail');
  s.addText('The tools exporters already have make this worse, not better.',
    {x:M, y:0.95, w:12, h:0.7, fontFace:FH, fontSize:28, bold:true, color:C.navy, align:'left', valign:'top', margin:0});

  const cols = [
    ['Business cards & spreadsheets', C.slate200, C.slate50, [
      'Zero memory between shows',
      'No follow-up prompts',
      'Context lost within days',
    ], 'The default. Where leads go to die.'],
    ['A full CRM (HubSpot / Pipedrive)', C.slate200, C.slate50, [
      'Built for offices, not booths',
      'Needs setup & config nobody does',
      'Too heavy to use at a stand',
    ], 'Powerful, but the wrong shape for a trade floor.'],
    ['ExpoLead OS', C.em500, C.em50, [
      'Capture in seconds at the booth',
      'Remembers who you met, year to year',
      'No setup — opinionated by default',
    ], 'Purpose-built for the exhibition moment.'],
  ];
  const cw = (12.2-2*0.35)/3;
  cols.forEach(([t,line,fill,items,tag],i)=>{
    const x = M + i*(cw+0.35);
    const hi = i===2;
    card(s, x, 1.9, cw, 4.35, {line, fill:hi?fill:C.white});
    s.addShape(p.ShapeType.rect, {x, y:1.9, w:cw, h:0.09, fill:{color:hi?C.em500:C.slate300}, line:{type:'none'}});
    s.addText(t, {x:x+0.28, y:2.2, w:cw-0.56, h:0.75, fontFace:FH, fontSize:15, bold:true, color:hi?C.em700:C.navy, align:'left', valign:'top', lineSpacingMultiple:1.0, margin:0});
    const arr = items.map(it=>({text:it, options:{bullet:{code:'2022', indent:12},
      color:hi?C.slate700:C.slate600, breakLine:true, paraSpaceAfter:8}}));
    s.addText(arr, {x:x+0.28, y:3.05, w:cw-0.56, h:2.0, fontFace:FB, fontSize:12.5, align:'left', valign:'top', margin:0});
    s.addText(tag, {x:x+0.28, y:5.55, w:cw-0.56, h:0.6, fontFace:FB, fontSize:11, italic:true, color:hi?C.em600:C.slate500, align:'left', valign:'top', lineSpacingMultiple:1.05, margin:0});
  });
  // wedge line
  s.addText([
    {text:'The wedge:  ', options:{bold:true, color:C.em600}},
    {text:'we don’t replace the CRM. We win the one moment CRMs are worst at — the booth — and hand clean data to whatever they already use.', options:{color:C.slate700}},
  ], {x:M, y:6.5, w:12.2, h:0.5, fontFace:FB, fontSize:13, align:'left', valign:'middle', margin:0});
  footer(s); pageno(s,3);
})();

// ============================================================
// SLIDE 4 — WHAT I BUILT (beat 2)
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  eyebrow(s, M, 0.55, 'What I built');
  s.addText([
    {text:'A working product, live today — ', options:{color:C.navy}},
    {text:'not a mockup.', options:{color:C.em600}},
  ], {x:M, y:0.95, w:12, h:0.7, fontFace:FH, fontSize:28, bold:true, align:'left', valign:'top', margin:0});

  const feats = [
    ['Capture at the booth', 'Log a lead in seconds — company, what they want, quantity, next step. Built for a phone in a crowded hall.'],
    ['“Met before” memory', 'When you log a company you met at a past show, it surfaces the history instantly. Nothing else on the market does this.'],
    ['Exhibition library', 'Real shows built in (CHINACOAT, ICIF, Taiwan trade fairs). Pick your show, work your leads against it.'],
    ['Opinionated by default', 'Ready-made views, no dashboards to configure. Ease first, so the data actually gets entered.'],
    ['Works alongside any CRM', 'Export clean, structured leads. We complement HubSpot / Pipedrive, we don’t fight them.'],
    ['Self-serve & priced to try', 'Free trial, then Starter $29 / Growth $99. A path from first login to paying, with no sales call.'],
  ];
  const cw = (12.2-2*0.3)/3, ch = 1.95;
  feats.forEach(([t,b],i)=>{
    const col = i%3, row = Math.floor(i/3);
    const x = M + col*(cw+0.3), y = 1.9 + row*(ch+0.28);
    card(s, x, y, cw, ch);
    s.addShape(p.ShapeType.roundRect, {x:x+0.25, y:y+0.24, w:0.14, h:0.14, rectRadius:0.03, fill:{color:C.em500}, line:{type:'none'}});
    s.addText(t, {x:x+0.5, y:y+0.16, w:cw-0.7, h:0.4, fontFace:FH, fontSize:13.5, bold:true, color:C.navy, align:'left', valign:'middle', margin:0});
    s.addText(b, {x:x+0.25, y:y+0.62, w:cw-0.5, h:1.2, fontFace:FB, fontSize:11, color:C.slate600, align:'left', valign:'top', lineSpacingMultiple:1.08, margin:0});
  });
  s.addText([
    {text:'Status:  ', options:{bold:true, color:C.navy}},
    {text:'Prototype V1 is pilot-ready and running on production infrastructure. The product exists; the next chapter is demand.', options:{color:C.slate600}},
  ], {x:M, y:6.55, w:12.2, h:0.4, fontFace:FB, fontSize:12, align:'left', valign:'middle', margin:0});
  footer(s); pageno(s,4);
})();

// ============================================================
// SLIDE 5 — THE MAGIC MOMENT ("met before")
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.navy};
  eyebrow(s, M, 0.55, 'The moment that sells it', C.em400);
  s.addText([
    {text:'“You met ', options:{color:C.white}},
    {text:'this company', options:{color:C.em400}},
    {text:' last year.”', options:{color:C.white}},
  ], {x:M, y:0.95, w:12, h:1.0, fontFace:FH, fontSize:34, bold:true, align:'left', valign:'top', margin:0});
  s.addText('Every exhibition is the same buyers, one year older. ExpoLead OS is the only tool that remembers — turning a cold re-introduction into a warm one.',
    {x:M, y:2.05, w:11, h:0.8, fontFace:FB, fontSize:15, color:C.slate300, align:'left', valign:'top', lineSpacingMultiple:1.1, margin:0});

  // mock re-encounter card
  card(s, M, 3.15, 7.6, 3.35, {fill:C.slate800, line:C.slate700});
  s.addText('NEW LEAD  ·  CHINACOAT 2026', {x:M+0.35, y:3.4, w:6, h:0.3, fontFace:FB, fontSize:10, bold:true, color:C.slate400, charSpacing:1.5, align:'left', valign:'middle', margin:0});
  s.addText('Zhejiang Coatings Co.', {x:M+0.35, y:3.7, w:6.8, h:0.45, fontFace:FH, fontSize:20, bold:true, color:C.white, align:'left', valign:'middle', margin:0});
  // met-before banner
  s.addShape(p.ShapeType.roundRect, {x:M+0.35, y:4.25, w:6.9, h:0.55, rectRadius:0.08, fill:{color:C.em700}, line:{type:'none'}});
  s.addText([
    {text:'✓  MET BEFORE  ', options:{bold:true, color:C.white}},
    {text:'ICIF 2025 · asked for 2 samples · never followed up', options:{color:C.em100}},
  ], {x:M+0.55, y:4.25, w:6.6, h:0.55, fontFace:FB, fontSize:11.5, align:'left', valign:'middle', margin:0});
  s.addText([
    {text:'Last time:  ', options:{bold:true, color:C.slate300}},
    {text:'12,000 units interest, price-sensitive, decision-maker on site.', options:{color:C.slate400}},
  ], {x:M+0.35, y:4.95, w:6.9, h:0.4, fontFace:FB, fontSize:11.5, align:'left', valign:'top', margin:0});
  s.addText('You walk up already knowing their history. That is the pitch.',
    {x:M+0.35, y:5.55, w:6.9, h:0.7, fontFace:FB, fontSize:12.5, italic:true, color:C.em400, align:'left', valign:'top', lineSpacingMultiple:1.05, margin:0});

  // right column: why it matters
  const rx = M+8.0, rw = 4.2;
  const pts = [
    ['Switching cost by design', 'The longer they use it, the more history it holds — and the harder we are to leave.'],
    ['Compounding data moat', 'Year-over-year memory is data a competitor can’t copy or buy.'],
    ['A reason to renew', 'Value grows every show cycle, not just in month one.'],
  ];
  pts.forEach(([t,b],i)=>{
    const y = 3.15 + i*1.15;
    s.addText(t, {x:rx, y, w:rw, h:0.35, fontFace:FH, fontSize:14, bold:true, color:C.em400, align:'left', valign:'top', margin:0});
    s.addText(b, {x:rx, y:y+0.34, w:rw, h:0.7, fontFace:FB, fontSize:11.5, color:C.slate300, align:'left', valign:'top', lineSpacingMultiple:1.08, margin:0});
  });
  footer(s, true); pageno(s,5);
})();

// ============================================================
// SLIDE 6 — COMPANIES I'VE SPOKEN TO (beat 3) — FILL
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  eyebrow(s, M, 0.55, 'Companies I’ve spoken to');
  s.addText([
    {text:'Real conversations with real exporters — ', options:{color:C.navy}},
    {text:'the demand is in their own words.', options:{color:C.em600}},
  ], {x:M, y:0.95, w:12.2, h:0.7, fontFace:FH, fontSize:26, bold:true, align:'left', valign:'top', margin:0});
  fillTag(s, M, 1.72, 3.4);

  // headline count strip
  const stats = [
    ['__', 'exporters interviewed'],
    ['__', 'said this is a real, painful problem'],
    ['__', 'want to pilot / would pay'],
  ];
  const sw = (12.2-2*0.3)/3;
  stats.forEach(([n,l],i)=>{
    const x = M + i*(sw+0.3);
    card(s, x, 2.2, sw, 1.15, {fill:C.em50, line:C.em100});
    s.addText(n, {x:x+0.3, y:2.32, w:1.4, h:0.9, fontFace:FH, fontSize:36, bold:true, color:C.em600, align:'left', valign:'middle', margin:0});
    s.addText(l, {x:x+1.7, y:2.32, w:sw-2.0, h:0.9, fontFace:FB, fontSize:12, color:C.slate600, align:'left', valign:'middle', lineSpacingMultiple:1.05, margin:0});
  });

  // table header
  const ty = 3.65, rowH = 0.72;
  const cols = [['Company / segment', 3.2], ['Their pain, in their words', 6.4], ['Signal', 2.6]];
  let cx = M;
  s.addShape(p.ShapeType.rect, {x:M, y:ty, w:12.2, h:0.42, fill:{color:C.navy}, line:{type:'none'}});
  cols.forEach(([t,w])=>{
    s.addText(t, {x:cx+0.15, y:ty, w:w-0.2, h:0.42, fontFace:FH, fontSize:11, bold:true, color:C.white, align:'left', valign:'middle', margin:0});
    cx += w;
  });
  // 4 blank rows
  for(let r=0;r<4;r++){
    const y = ty+0.42+r*rowH;
    s.addShape(p.ShapeType.rect, {x:M, y, w:12.2, h:rowH, fill:{color: r%2?C.slate50:C.white}, line:{color:C.slate200, width:0.5}});
    let x2 = M;
    ['[ Company — tea / food / chemicals / … ]','“ ______________________________________________________ ”','[ pilot / paid / warm ]'].forEach((ph,ci)=>{
      const w = cols[ci][1];
      s.addText(ph, {x:x2+0.15, y, w:w-0.2, h:rowH, fontFace:FB, fontSize:10.5, italic:true, color:C.slate400, align:'left', valign:'middle', margin:0});
      x2 += w;
    });
  }
  s.addText('Tip: even 8–12 named, quoted conversations from your tea / trade network beat a fabricated user count. This is your unfair advantage — no outside founder can source these.',
    {x:M, y:6.7, w:12.2, h:0.5, fontFace:FB, fontSize:10.5, italic:true, color:C.slate500, align:'left', valign:'top', lineSpacingMultiple:1.05, margin:0});
  footer(s); pageno(s,6);
})();

// ============================================================
// SLIDE 7 — WHAT I'M LEARNING (beat 4) — partly FILL
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  eyebrow(s, M, 0.55, 'What I’m learning');
  s.addText('Signals from the field — and what I changed because of them.',
    {x:M, y:0.95, w:12, h:0.7, fontFace:FH, fontSize:26, bold:true, color:C.navy, align:'left', valign:'top', margin:0});

  const cards = [
    ['They don’t want another CRM', 'The pull is not “manage my pipeline.” It is “don’t let my booth conversations evaporate.” Confirms the alongside-any-CRM wedge.', false],
    ['Quantity beats price', 'For product exporters, the deal-shaping number is how much, not the per-unit price. The capture flow is built around quantity.', false],
    ['Ease is the whole game', 'If it takes setup, the data never gets entered. Opinionated defaults over configurable dashboards.', false],
    ['[ Your surprise insight ]', 'The one thing a conversation taught you that you did NOT expect — and what you changed. Investors weight this most: it shows you listen and iterate.', true],
  ];
  const cw = (12.2-0.35)/2, chh = 2.15;
  cards.forEach(([t,b,fill],i)=>{
    const col = i%2, row = Math.floor(i/2);
    const x = M + col*(cw+0.35), y = 1.85 + row*(chh+0.3);
    card(s, x, y, cw, chh, {fill: fill?C.amber50:C.white, line: fill?C.amberBd:C.slate200});
    s.addShape(p.ShapeType.rect, {x, y, w:0.09, h:chh, fill:{color: fill?C.amber:C.em500}, line:{type:'none'}});
    s.addText(t, {x:x+0.35, y:y+0.28, w:cw-0.6, h:0.5, fontFace:FH, fontSize:16, bold:true, color: fill?C.amberTx:C.navy, align:'left', valign:'top', margin:0});
    s.addText(b, {x:x+0.35, y:y+0.85, w:cw-0.6, h:1.15, fontFace:FB, fontSize:12.5, color: fill?C.amberTx:C.slate600, align:'left', valign:'top', lineSpacingMultiple:1.12, margin:0});
  });
  fillTag(s, M+cw+0.35, 1.55, 3.4);
  footer(s); pageno(s,7);
})();

// ============================================================
// SLIDE 8 — BUSINESS MODEL
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  eyebrow(s, M, 0.55, 'How it makes money');
  s.addText('Self-serve SaaS, with a group-licensing unlock built for how exporters actually buy.',
    {x:M, y:0.95, w:12.2, h:1.0, fontFace:FH, fontSize:25, bold:true, color:C.navy, align:'left', valign:'top', lineSpacingMultiple:1.0, margin:0});

  const tiers = [
    ['Trial', 'Free', 'Full workflow, capped. Prove value before paying — no sales call.', C.slate200, C.white, C.navy],
    ['Starter', '$29 / mo', 'The solo exporter or small booth team. Unlocks export and higher caps.', C.slate200, C.white, C.navy],
    ['Growth', '$99 / mo', 'Active exhibitors running multiple shows a year. The core revenue tier.', C.em500, C.em50, C.em700],
  ];
  const cw = (12.2-2*0.3)/3;
  tiers.forEach(([n,pr,d,line,fill,tc],i)=>{
    const x = M + i*(cw+0.3);
    const hi = i===2;
    card(s, x, 2.1, cw, 2.55, {line, fill});
    s.addText(n, {x:x+0.3, y:2.3, w:cw-0.6, h:0.4, fontFace:FH, fontSize:14, bold:true, color:hi?C.em600:C.slate500, charSpacing:1, align:'left', valign:'top', margin:0});
    s.addText(pr, {x:x+0.3, y:2.72, w:cw-0.6, h:0.6, fontFace:FH, fontSize:28, bold:true, color:tc, align:'left', valign:'top', margin:0});
    s.addText(d, {x:x+0.3, y:3.45, w:cw-0.6, h:1.0, fontFace:FB, fontSize:12, color:C.slate600, align:'left', valign:'top', lineSpacingMultiple:1.1, margin:0});
  });

  // the unlock
  card(s, M, 4.95, 12.2, 1.75, {fill:C.slate50, line:C.slate200});
  s.addShape(p.ShapeType.rect, {x:M, y:4.95, w:0.09, h:1.75, fill:{color:C.em500}, line:{type:'none'}});
  s.addText('The distribution unlock', {x:M+0.35, y:5.15, w:11.5, h:0.4, fontFace:FH, fontSize:15, bold:true, color:C.navy, align:'left', valign:'top', margin:0});
  s.addText('Exporters don’t buy software one by one — they move through trade bodies. The plan is group-licensing via the Sri Lanka Tea Board and the Export Development Board: onboard a whole cohort of exporters at once, through an institution they already trust. One deal, many seats.',
    {x:M+0.35, y:5.55, w:11.5, h:1.0, fontFace:FB, fontSize:12.5, color:C.slate700, align:'left', valign:'top', lineSpacingMultiple:1.12, margin:0});
  footer(s); pageno(s,8);
})();

// ============================================================
// SLIDE 9 — WHY THIS EXTENDS BEYOND SRI LANKA (beat 5)
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  eyebrow(s, M, 0.55, 'Why this extends beyond Sri Lanka');
  s.addText([
    {text:'Sri Lanka is the beachhead, ', options:{color:C.navy}},
    {text:'not the ceiling.', options:{color:C.em600}},
  ], {x:M, y:0.95, w:12, h:0.7, fontFace:FH, fontSize:28, bold:true, align:'left', valign:'top', margin:0});
  s.addText('The problem is identical for any product exporter, anywhere. We start where I have unfair access, then follow the trade routes outward.',
    {x:M, y:1.62, w:12, h:0.6, fontFace:FB, fontSize:14, color:C.slate600, align:'left', valign:'top', lineSpacingMultiple:1.08, margin:0});

  // 3-stage expansion
  const stages = [
    ['1  ·  Beachhead', 'Sri Lanka', 'Tea & food exporters. Founder-owned network + Tea Board / EDB group-licensing. Win the reference base.', C.em500, C.em50, C.em700],
    ['2  ·  The shows they attend', 'China & Taiwan', 'The exhibition library already carries CHINACOAT, ICIF and 10 Taiwan shows — the exact fairs SL exporters fly to. We follow our users abroad.', C.slate300, C.white, C.navy],
    ['3  ·  Any exhibition trade', 'Regional & global', 'Chemicals, apparel, machinery, food — same booth, same lost-lead problem, same wedge. The workflow travels; only the show list changes.', C.slate300, C.white, C.navy],
  ];
  const cw = (12.2-2*0.3)/3;
  stages.forEach(([tag,place,d,line,fill,tc],i)=>{
    const x = M + i*(cw+0.3);
    const hi = i===0;
    card(s, x, 2.4, cw, 3.15, {line, fill});
    s.addShape(p.ShapeType.rect, {x, y:2.4, w:cw, h:0.09, fill:{color:hi?C.em500:C.slate300}, line:{type:'none'}});
    s.addText(tag, {x:x+0.28, y:2.62, w:cw-0.56, h:0.35, fontFace:FH, fontSize:11, bold:true, color:hi?C.em600:C.slate500, charSpacing:1, align:'left', valign:'top', margin:0});
    s.addText(place, {x:x+0.28, y:2.98, w:cw-0.56, h:0.55, fontFace:FH, fontSize:20, bold:true, color:tc, align:'left', valign:'top', margin:0});
    s.addText(d, {x:x+0.28, y:3.62, w:cw-0.56, h:1.8, fontFace:FB, fontSize:12, color:C.slate600, align:'left', valign:'top', lineSpacingMultiple:1.12, margin:0});
    if(i<2) s.addText('→', {x:x+cw+0.02, y:3.7, w:0.26, h:0.5, fontFace:FH, fontSize:22, bold:true, color:C.slate300, align:'center', valign:'middle', margin:0});
  });
  s.addText([
    {text:'The through-line:  ', options:{bold:true, color:C.em600}},
    {text:'the wedge (win the booth, no setup, feed any CRM) is geography-agnostic. What we build for a Colombo tea exporter is exactly what a São Paulo or Istanbul exporter needs.', options:{color:C.slate700}},
  ], {x:M, y:5.85, w:12.2, h:0.7, fontFace:FB, fontSize:12.5, align:'left', valign:'top', lineSpacingMultiple:1.1, margin:0});
  footer(s); pageno(s,9);
})();

// ============================================================
// SLIDE 10 — WHERE THIS GOES NEXT / THE ASK
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.navy};
  logo(s, M, 0.5, true);
  eyebrow(s, M, 1.4, 'Where this goes next', C.em400);
  s.addText('The product is built. The next chapter is proving pull, then scaling distribution.',
    {x:M, y:1.8, w:11.5, h:1.0, fontFace:FH, fontSize:26, bold:true, color:C.white, align:'left', valign:'top', lineSpacingMultiple:1.05, margin:0});

  const miles = [
    ['Now – 3 mo', 'Convert my network into signed pilots. Turn discovery into paying reference accounts.'],
    ['3 – 9 mo', 'Land the first Tea Board / EDB group-licensing cohort. Prove multi-seat distribution.'],
    ['9 – 18 mo', 'Follow users to China / Taiwan shows. Open the second geography off real usage.'],
  ];
  const cw = (12.2-2*0.3)/3;
  miles.forEach(([t,b],i)=>{
    const x = M + i*(cw+0.3);
    card(s, x, 3.05, cw, 1.8, {fill:C.slate800, line:C.slate700});
    s.addText(t, {x:x+0.28, y:3.25, w:cw-0.56, h:0.4, fontFace:FH, fontSize:14, bold:true, color:C.em400, align:'left', valign:'top', margin:0});
    s.addText(b, {x:x+0.28, y:3.68, w:cw-0.56, h:1.0, fontFace:FB, fontSize:12, color:C.slate300, align:'left', valign:'top', lineSpacingMultiple:1.12, margin:0});
  });

  // the ask
  card(s, M, 5.2, 12.2, 1.4, {fill:C.em700, line:C.em700});
  s.addText('The ask', {x:M+0.4, y:5.4, w:3, h:0.4, fontFace:FH, fontSize:13, bold:true, color:C.em100, charSpacing:1.5, align:'left', valign:'top', margin:0});
  s.addText('[ State exactly what you want from this person: a check of $___ to fund the pilot-to-paid push, an intro to Tea Board / EDB, or their read on the plan. Make it one clear, specific line. ]',
    {x:M+0.4, y:5.75, w:11.4, h:0.7, fontFace:FB, fontSize:13, italic:true, color:C.white, align:'left', valign:'top', lineSpacingMultiple:1.05, margin:0});
  s.addText([
    {text:'Gladwin Gerald', options:{color:C.white, bold:true}},
    {text:'  ·  gladwin.p.gerald@gmail.com  ·  ExpoLead OS', options:{color:C.slate400}},
  ], {x:M, y:6.85, w:11, h:0.35, fontFace:FB, fontSize:11, align:'left', valign:'middle', margin:0});
  pageno(s,10);
})();

p.writeFile({ fileName: OUT }).then(()=>console.log('WROTE', OUT));
