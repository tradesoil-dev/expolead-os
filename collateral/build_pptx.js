const pptxgen = require('pptxgenjs');
const path = require('path');

const OUT = path.join(__dirname, 'ExpoLead-CRM-Positioning-v3.pptx');

// ---- palette ----
const C = {
  navy:'0F172A', slate800:'1E293B', slate700:'334155', slate600:'475569',
  slate500:'64748B', slate400:'94A3B8', slate300:'CBD5E1', slate200:'E2E8F0',
  slate100:'F1F5F9', slate50:'F8FAFC',
  em700:'047857', em600:'059669', em500:'10B981', em400:'34D399',
  em100:'D1FAE5', em50:'ECFDF5',
  amber:'F59E0B', amber50:'FFFBEB', amberBd:'FDE68A', amberTx:'7C5B16',
  white:'FFFFFF',
};
const FB = 'Calibri';           // body
const FH = 'Calibri';           // headings (bold)

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
  s.addText(text.toUpperCase(), {x, y, w:9, h:0.3, fontFace:FH, fontSize:11, bold:true,
    color: color||C.em600, charSpacing:2.2, align:'left', valign:'middle', margin:0});
}
function chip(s, x, y, w, h, text, opt){
  opt = opt||{};
  s.addShape(p.ShapeType.roundRect, {x,y,w,h,rectRadius:0.09,
    fill:{color:opt.fill||C.white}, line:{color:opt.line||C.slate200, width:1}});
  s.addText(text, {x, y, w, h, fontFace:FB, fontSize:opt.fs||10.5, bold:opt.bold!==false,
    color:opt.color||C.slate700, align:'center', valign:'middle', margin:0});
}
// chain of nodes with > separators
function chain(s, x, y, w, nodes, color, nodeFill, nodeLine){
  let cx = x; const h=0.34, gap=0.14, sep=0.16;
  nodes.forEach((n,i)=>{
    const nw = 0.14 + n.length*0.078;
    s.addShape(p.ShapeType.roundRect, {x:cx, y, w:nw, h, rectRadius:0.06,
      fill:{color:nodeFill}, line:{color:nodeLine, width:1}});
    s.addText(n, {x:cx, y, w:nw, h, fontFace:FB, fontSize:10.5, bold:true, color, align:'center', valign:'middle', margin:0});
    cx += nw;
    if(i<nodes.length-1){
      s.addText('›', {x:cx, y, w:sep+gap, h, fontFace:FB, fontSize:13, bold:true, color:nodeLine, align:'center', valign:'middle', margin:0});
      cx += sep+gap;
    }
  });
}
function bulletBox(s, x, y, w, h, items, dotColor, txtColor){
  const arr = items.map((t,i)=>({text:t, options:{
    bullet:{code:'2022', indent:12}, color:txtColor, breakLine:true, paraSpaceAfter:6}}));
  s.addText(arr, {x, y, w, h, fontFace:FB, fontSize:12, align:'left', valign:'top', margin:0, color:txtColor});
}

// ============================================================
// SLIDE 1 — TITLE (dark)
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.navy};
  logo(s, M, 0.5, true);
  s.addText('POSITIONING  ·  FOR TEAMS WHO ALREADY USE A CRM',
    {x:PW-6.6, y:0.5, w:6.05, h:0.3, fontFace:FH, fontSize:11, bold:true, color:C.slate400, charSpacing:1.5, align:'right', valign:'middle', margin:0});

  eyebrow(s, M, 2.05, 'Two systems. Two different jobs.', C.em400);
  s.addText([
    {text:'Your CRM manages the relationship.', options:{color:C.white, breakLine:true}},
    {text:'ExpoLead manages the exhibition journey.', options:{color:C.em400}},
  ], {x:M, y:2.4, w:11.6, h:1.9, fontFace:FH, fontSize:40, bold:true, align:'left', valign:'top', lineSpacingMultiple:1.02, margin:0});

  s.addText('ExpoLead does not replace your CRM. It gives your exhibition team a purpose-built workspace for the part of the commercial journey that happens before, during and immediately after the show.',
    {x:M, y:4.35, w:9.6, h:0.9, fontFace:FB, fontSize:15, color:'CBD5E1', align:'left', valign:'top', lineSpacingMultiple:1.15, margin:0});

  // no-rip-and-replace strip (coexistence, not an integrations claim)
  s.addText('NO RIP AND REPLACE', {x:M, y:5.75, w:9, h:0.28, fontFace:FH, fontSize:10.5, bold:true, color:C.em400, charSpacing:1.5, align:'left', valign:'middle', margin:0});
  s.addText([{text:'Keep the CRM you already use. ', options:{color:C.white, bold:true}},{text:'ExpoLead owns the exhibition, then you take the clean lead into your CRM.', options:{color:'CBD5E1'}}],
    {x:M, y:6.08, w:10.5, h:0.5, fontFace:FB, fontSize:14.5, align:'left', valign:'top', lineSpacingMultiple:1.12, margin:0});
  s.addNotes('Opening frame: ExpoLead is not a CRM competitor and is not sold as a CRM integration. It runs the exhibition and owns only the exhibition layer; the user keeps whatever CRM they already run and takes the clean lead into it. We do not have CRM integrations today.');
})();

// ============================================================
// SLIDE 2 — JOURNEY BAND
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  logo(s, M, 0.45, false);
  eyebrow(s, M, 1.15, 'The commercial workflow', C.em600);
  s.addText('Where ExpoLead sits, and where your CRM takes over',
    {x:M, y:1.45, w:12, h:0.6, fontFace:FH, fontSize:28, bold:true, color:C.navy, align:'left', valign:'top', margin:0});

  const startX = M, gap = 0.22;
  const cardW = (PW - 2*M - 3*gap)/4;
  const cols = [0,1,2,3].map(i=> startX + i*(cardW+gap));

  // layer bars
  s.addShape(p.ShapeType.roundRect, {x:cols[0], y:2.35, w:cardW*3+gap*2, h:0.34, rectRadius:0.07, fill:{color:C.em50}, line:{type:'none'}});
  s.addText('EXPOLEAD OS  ·  THE EXHIBITION LAYER', {x:cols[0]+0.12, y:2.35, w:cardW*3, h:0.34, fontFace:FH, fontSize:10.5, bold:true, color:C.em700, charSpacing:1.2, align:'left', valign:'middle', margin:0});
  s.addShape(p.ShapeType.roundRect, {x:cols[2], y:2.77, w:cardW*2+gap, h:0.34, rectRadius:0.07, fill:{color:C.slate100}, line:{type:'none'}});
  s.addText('YOUR CRM  ·  THE RELATIONSHIP LAYER', {x:cols[2]+0.12, y:2.77, w:cardW*2, h:0.34, fontFace:FH, fontSize:10.5, bold:true, color:C.slate600, charSpacing:1.2, align:'left', valign:'middle', margin:0});

  const stages = [
    {n:'01', t:'Before expo', role:'PLAN', roleC:C.em600, items:['Set targets','Identify companies','Prioritise booths','Prepare objectives'], exp:true},
    {n:'02', t:'During expo', role:'CAPTURE', roleC:C.em600, items:['Record conversations','Identify opportunities','Set priorities','Note next actions'], exp:true},
    {n:'03', t:'After expo', role:'CONVERT', roleC:C.em600, items:['Follow up','Track commitments','Progress opportunities','Read exhibition outcomes'], exp:true},
    {n:'04', t:'Ongoing sales', role:'MANAGE · CRM', roleC:C.slate500, items:['Contacts & accounts','Deals & pipeline','Activities','Customer relationships','Revenue'], exp:false},
  ];
  const cardY = 3.25, cardH = 3.35;
  stages.forEach((st,i)=>{
    const x = cols[i];
    s.addShape(p.ShapeType.roundRect, {x, y:cardY, w:cardW, h:cardH, rectRadius:0.09,
      fill:{color: st.exp? C.white : C.slate50}, line:{color: st.exp? C.em100 : C.slate200, width:1.2},
      shadow:{type:'outer', color:'101018', opacity:0.06, blur:6, offset:2, angle:90}});
    s.addText(st.n, {x:x+0.22, y:cardY+0.16, w:1, h:0.24, fontFace:FH, fontSize:11, bold:true, color:C.slate300, charSpacing:1, margin:0});
    s.addText(st.t, {x:x+0.22, y:cardY+0.4, w:cardW-0.4, h:0.36, fontFace:FH, fontSize:16, bold:true, color:C.navy, margin:0});
    s.addText(st.role, {x:x+0.22, y:cardY+0.78, w:cardW-0.4, h:0.26, fontFace:FH, fontSize:10.5, bold:true, color:st.roleC, charSpacing:1, margin:0});
    const arr = st.items.map(t=>({text:t, options:{bullet:{code:'2022', indent:11}, color:C.slate700, breakLine:true, paraSpaceAfter:5}}));
    s.addText(arr, {x:x+0.22, y:cardY+1.15, w:cardW-0.42, h:cardH-1.3, fontFace:FB, fontSize:11.5, align:'left', valign:'top', margin:0, color:C.slate700});
  });
  // shared ground tag under card 3
  s.addShape(p.ShapeType.roundRect, {x:cols[2]+0.22, y:cardY+cardH-0.42, w:cardW-0.44, h:0.3, rectRadius:0.08, fill:{color:C.em50}, line:{color:C.em400, width:1, dashType:'dash'}});
  s.addText('HANDOFF · QUALIFIED LEAD TO YOUR CRM', {x:cols[2]+0.22, y:cardY+cardH-0.42, w:cardW-0.44, h:0.3, fontFace:FH, fontSize:8.5, bold:true, color:C.em700, align:'center', valign:'middle', margin:0});

  s.addText('ExpoLead runs the show, then hands your CRM a clean, qualified lead. Two jobs on one timeline, not two tools doing the same job.',
    {x:M, y:6.95, w:12, h:0.35, fontFace:FB, fontSize:11, italic:true, color:C.slate500, align:'left', valign:'middle', margin:0});
  s.addNotes('ExpoLead spans Before / During / After. The CRM is the long-term system for Ongoing Sales. They overlap deliberately at After (opportunities and follow-up). No hard wall.');
})();

// ============================================================
// SLIDE 3 — RECORD-CENTRIC vs EXHIBITION-CENTRIC
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  logo(s, M, 0.45, false);
  eyebrow(s, M, 1.15, 'The conceptual difference', C.em600);
  s.addText('A CRM is built around records. ExpoLead is built around the exhibition.',
    {x:M, y:1.45, w:12, h:0.6, fontFace:FH, fontSize:26, bold:true, color:C.navy, align:'left', valign:'top', margin:0});

  // explanatory navy box
  s.addShape(p.ShapeType.roundRect, {x:M, y:2.3, w:PW-2*M, h:1.15, rectRadius:0.1, fill:{color:C.navy}, line:{type:'none'}});
  s.addText([
    {text:'CRM systems are excellent at managing structured customer and sales data over time. ', options:{bold:true, color:C.white}},
    {text:'ExpoLead is purpose-built for the high-volume, fast-moving environment of exhibitions, helping teams organise what they want to achieve before the show, capture what happens on the floor, and turn conversations into structured opportunities and actions immediately afterwards.', options:{color:'CBD5E1'}},
  ], {x:M+0.35, y:2.3, w:PW-2*M-0.7, h:1.15, fontFace:FB, fontSize:14, align:'left', valign:'middle', lineSpacingMultiple:1.15, margin:0});

  // record-centric
  s.addShape(p.ShapeType.roundRect, {x:M, y:3.85, w:PW-2*M, h:1.2, rectRadius:0.1, fill:{color:C.slate50}, line:{color:C.slate200, width:1}});
  s.addText('CRM IS PRIMARILY RECORD-CENTRIC', {x:M+0.3, y:4.0, w:8, h:0.28, fontFace:FH, fontSize:11, bold:true, color:C.slate500, charSpacing:1.2, margin:0});
  chain(s, M+0.3, 4.42, 0, ['Contact','Company','Deal','Activity','Pipeline'], C.slate700, C.white, C.slate200);

  // exhibition-centric
  s.addShape(p.ShapeType.roundRect, {x:M, y:5.25, w:PW-2*M, h:1.65, rectRadius:0.1, fill:{color:C.em50}, line:{color:C.em100, width:1}});
  s.addText('EXPOLEAD IS EXHIBITION-CENTRIC', {x:M+0.3, y:5.4, w:8, h:0.28, fontFace:FH, fontSize:11, bold:true, color:C.em700, charSpacing:1.2, margin:0});
  chain(s, M+0.3, 5.8, 0, ['Exhibition','Target','Booth','Person','Conversation','Product / need'], C.em700, C.white, C.em100);
  chain(s, M+0.3, 6.28, 0, ['Opportunity','Commitment','Follow-up','Outcome'], C.em700, C.white, C.em100);

  s.addNotes('The unit of work is different. A CRM organises around the contact and the deal. ExpoLead organises around the exhibition and everything it generates. It is the operational workspace around the show, not another contact database.');
})();

// ============================================================
// SLIDE 4 — A CRM BEGINS WHERE THE EXHIBITION ENDS (handoff, no grid)
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  logo(s, M, 0.4, false);
  s.addText('IF YOU ALREADY USE A CRM  ·  THIS IS WHERE EXPOLEAD FITS',
    {x:PW-7.4, y:0.42, w:6.85, h:0.3, fontFace:FH, fontSize:10, bold:true, color:C.slate400, charSpacing:1.4, align:'right', valign:'middle', margin:0});
  eyebrow(s, M, 1.05, 'Two jobs, one handoff', C.em600);
  s.addText([{text:'A CRM begins where the exhibition ', options:{color:C.navy}},{text:'ends.', options:{color:C.em600}}],
    {x:M, y:1.33, w:12, h:0.55, fontFace:FH, fontSize:27, bold:true, align:'left', valign:'top', margin:0});
  s.addText('Your CRM starts with the lead. ExpoLead is everything that happens before it becomes one, then it hands your CRM a clean, qualified opportunity when the show is done.',
    {x:M, y:1.95, w:11.8, h:0.5, fontFace:FB, fontSize:13, color:C.slate600, align:'left', valign:'top', lineSpacingMultiple:1.1, margin:0});

  // ---- HERO FLOW: operation -> one clean lead -> your CRM ----
  const hy = 2.75, hh = 2.35;
  const aX = M, aW = 6.2;
  const arr1X = aX+aW, arrW = 0.35;
  const lX = arr1X+arrW, lW = 2.5;
  const arr2X = lX+lW, cX = arr2X+arrW, cW = (PW-M) - cX;

  // Zone A — the exhibition (ExpoLead)
  s.addShape(p.ShapeType.roundRect, {x:aX, y:hy, w:aW, h:hh, rectRadius:0.12, fill:{color:C.em50}, line:{color:C.em100, width:1.2}});
  s.addText('THE EXHIBITION · EXPOLEAD RUNS THIS', {x:aX+0.25, y:hy+0.2, w:aW-0.5, h:0.28, fontFace:FH, fontSize:10.5, bold:true, color:C.em700, charSpacing:1, margin:0});
  const ops=['Plan targets & booths','Capture on the floor','Prioritise on the spot','Track commitments','Structure the outcome'];
  let ox=aX+0.25, oy=hy+0.62; const omax=aX+aW-0.25;
  ops.forEach((t,i)=>{
    const w=0.28+t.length*0.078, h=0.36;
    if(ox+w>omax){ ox=aX+0.25; oy+=h+0.13; }
    s.addShape(p.ShapeType.roundRect, {x:ox, y:oy, w, h, rectRadius:0.06, fill:{color:C.white}, line:{color:C.em100, width:1}});
    s.addText(t, {x:ox, y:oy, w, h, fontFace:FB, fontSize:10.5, bold:true, color:C.em700, align:'center', valign:'middle', margin:0});
    ox+=w;
    if(i<ops.length-1){ const nw=0.28+ops[i+1].length*0.078; if(ox+0.22+nw<=omax){ s.addText('›', {x:ox, y:oy, w:0.22, h, fontFace:FB, fontSize:12, bold:true, color:C.em400, align:'center', valign:'middle', margin:0}); ox+=0.22; } }
  });
  s.addText('Hall, booth, product and conversation context, captured at booth speed across dozens of meetings, then turned into structured opportunities.',
    {x:aX+0.25, y:hy+hh-0.72, w:aW-0.5, h:0.6, fontFace:FB, fontSize:11, color:C.slate600, align:'left', valign:'top', lineSpacingMultiple:1.1, margin:0});

  // arrows
  s.addText('›', {x:arr1X, y:hy, w:arrW, h:hh, fontFace:FB, fontSize:26, bold:true, color:C.slate300, align:'center', valign:'middle', margin:0});
  s.addText('›', {x:arr2X, y:hy, w:arrW, h:hh, fontFace:FB, fontSize:26, bold:true, color:C.slate300, align:'center', valign:'middle', margin:0});

  // Lead card (centered in hero height)
  const lcH = 1.55, lcY = hy+(hh-lcH)/2;
  s.addShape(p.ShapeType.roundRect, {x:lX, y:lcY, w:lW, h:lcH, rectRadius:0.1, fill:{color:C.white}, line:{color:C.em400, width:1.5},
    shadow:{type:'outer', color:'10B981', opacity:0.22, blur:10, offset:3, angle:90}});
  s.addShape(p.ShapeType.roundRect, {x:lX+0.18, y:lcY+0.18, w:1.95, h:0.26, rectRadius:0.05, fill:{color:C.em50}, line:{color:C.em100, width:1}});
  s.addText('ONE CLEAN, QUALIFIED LEAD', {x:lX+0.18, y:lcY+0.18, w:1.95, h:0.26, fontFace:FH, fontSize:8, bold:true, color:C.em700, align:'center', valign:'middle', margin:0});
  s.addText('Acme Foods Ltd', {x:lX+0.2, y:lcY+0.52, w:lW-0.4, h:0.3, fontFace:FH, fontSize:14, bold:true, color:C.navy, align:'left', valign:'middle', margin:0});
  s.addText([{text:'John Perera', options:{bold:true, color:C.slate700}},{text:', Buyer', options:{color:C.slate600}}],
    {x:lX+0.2, y:lcY+0.82, w:lW-0.4, h:0.22, fontFace:FB, fontSize:10.5, align:'left', valign:'middle', margin:0});
  s.addText('Needs: 500 MT, monthly', {x:lX+0.2, y:lcY+1.03, w:lW-0.4, h:0.22, fontFace:FB, fontSize:10.5, color:C.slate600, align:'left', valign:'middle', margin:0});
  s.addText('Priority: High, sample promised', {x:lX+0.2, y:lcY+1.24, w:lW-0.4, h:0.22, fontFace:FB, fontSize:10.5, color:C.slate600, align:'left', valign:'middle', margin:0});

  // Zone C — your CRM
  s.addShape(p.ShapeType.roundRect, {x:cX, y:hy, w:cW, h:hh, rectRadius:0.12, fill:{color:C.slate50}, line:{color:C.slate200, width:1.2}});
  s.addText('YOUR CRM STARTS HERE', {x:cX+0.22, y:hy+0.2, w:cW-0.44, h:0.28, fontFace:FH, fontSize:10.5, bold:true, color:C.slate600, charSpacing:1, margin:0});
  s.addShape(p.ShapeType.roundRect, {x:cX+0.22, y:hy+0.6, w:cW-0.44, h:hh-0.82, rectRadius:0.09, fill:{color:C.white}, line:{color:C.slate200, width:1}});
  s.addText('Contact & deal created', {x:cX+0.42, y:hy+0.78, w:cW-0.84, h:0.26, fontFace:FH, fontSize:11.5, bold:true, color:C.navy, align:'left', valign:'middle', margin:0});
  s.addText('Stage: open', {x:cX+0.42, y:hy+1.06, w:cW-0.84, h:0.22, fontFace:FB, fontSize:10.5, color:C.slate600, align:'left', valign:'middle', margin:0});
  s.addText('Owner assigned', {x:cX+0.42, y:hy+1.28, w:cW-0.84, h:0.22, fontFace:FB, fontSize:10.5, color:C.slate600, align:'left', valign:'middle', margin:0});
  s.addText('From here your CRM does what it does best: long-term relationship, pipeline and revenue.',
    {x:cX+0.42, y:hy+1.6, w:cW-0.84, h:0.6, fontFace:FB, fontSize:9.5, color:C.slate500, align:'left', valign:'top', lineSpacingMultiple:1.1, margin:0});

  // ---- Bottom punch band ----
  s.addShape(p.ShapeType.roundRect, {x:M, y:5.45, w:PW-2*M, h:1.5, rectRadius:0.12, fill:{color:C.navy}, line:{type:'none'}});
  s.addText([{text:'Both hold a contact. ', options:{color:C.white}},{text:'Only one ran the exhibition that produced it.', options:{color:C.em400}}],
    {x:M+0.35, y:5.7, w:PW-2*M-0.7, h:0.5, fontFace:FH, fontSize:19, bold:true, align:'left', valign:'top', margin:0});
  s.addText('A CRM begins with the finished lead. Everything before that clean record, the plan, the floor and the follow-through, is the ExpoLead job. You then take that clean lead into whatever CRM you already use.',
    {x:M+0.35, y:6.28, w:PW-2*M-0.7, h:0.55, fontFace:FB, fontSize:12.5, color:'CBD5E1', align:'left', valign:'top', lineSpacingMultiple:1.12, margin:0});

  s.addNotes('No comparison grid. The CRM appears only as the downstream recipient of a clean, qualified lead. This removes any row-by-row "my CRM does that too" reflex: we are showing a sequence, not a feature contest. A CRM begins where the exhibition ends.');
})();

// ============================================================
// SLIDE 5 — THE MISSING LAYER (workflow: without vs with)
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  logo(s, M, 0.4, false);
  s.addText('THE EXHIBITION WORKFLOW', {x:PW-5.5, y:0.42, w:4.95, h:0.3, fontFace:FH, fontSize:10, bold:true, color:C.slate400, charSpacing:1.4, align:'right', valign:'middle', margin:0});
  eyebrow(s, M, 1.05, 'The missing layer', C.em600);
  s.addText([{text:'ExpoLead is the ', options:{color:C.navy}},{text:'missing layer', options:{color:C.em600}},{text:' between the exhibition floor and your CRM.', options:{color:C.navy}}],
    {x:M, y:1.32, w:12.1, h:0.9, fontFace:FH, fontSize:23, bold:true, align:'left', valign:'top', lineSpacingMultiple:1.02, margin:0});
  s.addText('It captures opportunities on the floor. Your CRM manages them afterwards. Different purpose, different time, complete together.',
    {x:M, y:2.3, w:12, h:0.35, fontFace:FB, fontSize:13, color:C.slate600, align:'left', valign:'top', margin:0});

  const chainRow=(items, y, endC, baseFill, baseLine, baseText)=>{
    const x=M, w=PW-2*M, n=items.length, aw=0.26;
    const nodeW=(w-(n-1)*aw)/n;
    let cx=x;
    items.forEach((t,i)=>{
      const end=(i===n-1);
      s.addShape(p.ShapeType.roundRect,{x:cx,y,w:nodeW,h:0.66,rectRadius:0.07,fill:{color:end?endC.fill:baseFill},line:{color:end?endC.line:baseLine,width:1}});
      s.addText(t,{x:cx+0.03,y,w:nodeW-0.06,h:0.66,fontFace:FB,fontSize:8.7,bold:true,color:end?endC.text:baseText,align:'center',valign:'middle',lineSpacingMultiple:0.95,margin:0});
      cx+=nodeW;
      if(!end){ s.addText('→',{x:cx,y,w:aw,h:0.66,fontFace:FB,fontSize:11,bold:true,color:baseLine,align:'center',valign:'middle',margin:0}); cx+=aw; }
    });
  };

  s.addText('WITHOUT EXPOLEAD', {x:M, y:2.8, w:6, h:0.26, fontFace:FH, fontSize:11, bold:true, color:'B91C1C', charSpacing:1, margin:0});
  chainRow(['Visit booth','Talk','Collect card','Notebook & photos','Back to office','Manual entry','Lost & missed leads'],
    3.08, {fill:'FEF2F2', line:'FECACA', text:'B91C1C'}, C.white, C.slate200, C.slate600);

  s.addText('WITH EXPOLEAD', {x:M, y:4.08, w:6, h:0.26, fontFace:FH, fontSize:11, bold:true, color:C.em700, charSpacing:1, margin:0});
  chainRow(['Visit booth','Open ExpoLead','Capture info','Product & booth','Follow-up tasks','Export (CSV)','Your CRM','Successful follow-up'],
    4.36, {fill:C.em500, line:C.em500, text:C.white}, C.white, C.em100, C.em700);

  s.addShape(p.ShapeType.roundRect, {x:M, y:5.5, w:PW-2*M, h:1.0, rectRadius:0.12, fill:{color:C.navy}, line:{type:'none'}});
  s.addText([{text:'ExpoLead captures the moment. ', options:{color:C.white}},{text:'Your CRM builds the future. ', options:{color:C.em400}},{text:'Together, they drive revenue.', options:{color:'CBD5E1'}}],
    {x:M+0.35, y:5.5, w:PW-2*M-0.7, h:1.0, fontFace:FH, fontSize:18, bold:true, align:'left', valign:'middle', margin:0});

  s.addText([{text:'Built for product exhibitions:  ', options:{bold:true, color:C.slate600}},{text:'Tea · Chemicals · Food & Beverage · Packaging · Machinery, and more.', options:{color:C.slate500}}],
    {x:M, y:6.68, w:12, h:0.35, fontFace:FB, fontSize:11.5, align:'left', valign:'middle', margin:0});

  s.addNotes('Core thesis: ExpoLead is not an alternative to a CRM, it is the missing layer between the exhibition floor and the CRM. Without ExpoLead the booth-to-CRM path leaks (cards, notebooks, back to the office, manual entry, lost leads). With ExpoLead the floor is captured cleanly and the lead reaches the CRM export-ready. Note: no live CRM sync today; export is CSV, then imported to the CRM.');
})();

// ============================================================
// SLIDE 6 — EXHIBITION REALITY + FRAGMENTS
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  logo(s, M, 0.45, false);
  eyebrow(s, M, 1.15, 'Why context matters', C.em600);
  s.addText('The exhibition floor is not a quiet desk',
    {x:M, y:1.45, w:12, h:0.55, fontFace:FH, fontSize:26, bold:true, color:C.navy, align:'left', valign:'top', margin:0});

  // LEFT dark reality card
  const lx=M, ly=2.35, lw=6.0, lh=4.35;
  s.addShape(p.ShapeType.roundRect, {x:lx, y:ly, w:lw, h:lh, rectRadius:0.1, fill:{color:C.navy}, line:{type:'none'}});
  s.addText('THE EXHIBITION REALITY', {x:lx+0.35, y:ly+0.3, w:lw-0.7, h:0.3, fontFace:FH, fontSize:11, bold:true, color:C.em400, charSpacing:1.2, margin:0});
  const thoughts=['Where do I go next?','Which booth is this?','Has a colleague visited them?','Who did I speak to?','What product did they want?','Did I promise a sample?','Is this one serious?','Who follows up?'];
  let tx=lx+0.35, ty=ly+0.8, rowMax=lx+lw-0.35;
  thoughts.forEach(t=>{
    const w=0.3+t.length*0.078, h=0.4;
    if(tx+w>rowMax){ tx=lx+0.35; ty+=h+0.12; }
    s.addShape(p.ShapeType.roundRect, {x:tx, y:ty, w, h, rectRadius:0.2, fill:{color:'1E293B'}, line:{color:C.slate700, width:1}});
    s.addText(t, {x:tx, y:ty, w, h, fontFace:FB, fontSize:11, bold:true, color:'DBEAFE', align:'center', valign:'middle', margin:0});
    tx+=w+0.12;
  });
  s.addText([{text:'Dozens, sometimes hundreds of conversations, moving fast. ', options:{color:C.slate400}},{text:'ExpoLead is being designed around this environment.', options:{color:C.em400, bold:true}}],
    {x:lx+0.35, y:ly+lh-0.95, w:lw-0.7, h:0.75, fontFace:FB, fontSize:12.5, align:'left', valign:'middle', lineSpacingMultiple:1.15, margin:0});

  // RIGHT fragments -> workspace
  const rx=M+lw+0.4, rw=PW-M-rx;
  s.addText('THE REAL PROBLEM IS FRAGMENTED EXECUTION', {x:rx, y:2.5, w:rw, h:0.3, fontFace:FH, fontSize:11, bold:true, color:C.em600, charSpacing:1, margin:0});
  const frags=['Business cards','Phone contacts','WhatsApp','Notebook notes','Photos','Spreadsheets','Memory','Unstructured follow-ups'];
  let fx=rx, fy=3.0, fmax=rx+rw-2.9;
  frags.forEach(t=>{
    const w=0.28+t.length*0.072, h=0.4;
    if(fx+w>fmax){ fx=rx; fy+=h+0.12; }
    s.addShape(p.ShapeType.roundRect, {x:fx, y:fy, w, h, rectRadius:0.07, fill:{color:C.slate50}, line:{color:C.slate200, width:1}});
    s.addText(t, {x:fx, y:fy, w, h, fontFace:FB, fontSize:10, color:C.slate600, align:'center', valign:'middle', margin:0});
    fx+=w+0.12;
  });
  // arrow + one workspace
  s.addText('›', {x:rx+rw-2.75, y:3.4, w:0.5, h:0.7, fontFace:FB, fontSize:34, bold:true, color:C.slate300, align:'center', valign:'middle', margin:0});
  s.addShape(p.ShapeType.roundRect, {x:rx+rw-2.25, y:3.15, w:2.25, h:1.3, rectRadius:0.12, fill:{color:C.em600}, line:{type:'none'},
    shadow:{type:'outer', color:'10B981', opacity:0.35, blur:10, offset:3, angle:90}});
  s.addText([{text:'One exhibition\nworkspace', options:{bold:true, color:C.white, fontSize:14, breakLine:true}},{text:'structured & searchable', options:{color:C.em100, fontSize:10}}],
    {x:rx+rw-2.25, y:3.15, w:2.25, h:1.3, fontFace:FH, align:'center', valign:'middle', lineSpacingMultiple:1.0, margin:0});

  s.addShape(p.ShapeType.roundRect, {x:rx, y:5.35, w:rw, h:1.35, rectRadius:0.1, fill:{color:C.slate50}, line:{color:C.slate200, width:1}});
  s.addText([{text:'The real problem is not your CRM. ', options:{color:C.slate600}},{text:'It is fragmented exhibition execution,', options:{bold:true, color:C.navy}},{text:' brought into one place.', options:{color:C.slate600}}],
    {x:rx+0.3, y:5.35, w:rw-0.6, h:1.35, fontFace:FB, fontSize:14, align:'left', valign:'middle', lineSpacingMultiple:1.2, margin:0});

  s.addNotes('The enemy is not the CRM. It is business cards, WhatsApp, notebooks, photos, spreadsheets and memory scattered across the team. ExpoLead consolidates the exhibition layer into one structured workspace.');
})();

// ============================================================
// SLIDE 6 — INTELLIGENCE VALUE
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.white};
  logo(s, M, 0.45, false);
  eyebrow(s, M, 1.15, 'The long-term value', C.em600);
  s.addText([{text:'Not a business-card scanner. ', options:{color:C.navy}},{text:'An Exhibition Intelligence Workspace.', options:{color:C.em600}}],
    {x:M, y:1.45, w:12, h:0.55, fontFace:FH, fontSize:26, bold:true, align:'left', valign:'top', margin:0});
  s.addText('The value is turning exhibition activity into structured commercial intelligence, and helping management understand the performance of the show itself.',
    {x:M, y:2.1, w:11.5, h:0.5, fontFace:FB, fontSize:13, color:C.slate500, align:'left', valign:'top', margin:0});

  const cols = [
    {t:'BEFORE', road:false, items:['What are our objectives?','Who are our targets?','Which companies and booths matter?']},
    {t:'DURING', road:false, items:['Who has the team met?','What opportunities are emerging?','Who is high priority?','What commitments were made?']},
    {t:'AFTER', road:false, items:['What came out of the show?','Which opportunities need action?','Who owns each follow-up?','Which products drew interest?']},
    {t:'OVER TIME', road:true, items:['Which shows created real opportunities?','Which led to samples, quotes or orders?','Which shows deserve future investment?']},
  ];
  const gap=0.25, cw=(PW-2*M-3*gap)/4, cy=2.85, chH=3.6;
  cols.forEach((c,i)=>{
    const x=M+i*(cw+gap);
    s.addShape(p.ShapeType.roundRect, {x, y:cy, w:cw, h:chH, rectRadius:0.09, fill:{color: c.road? C.amber50 : C.slate50}, line:{color: c.road? C.amberBd : C.slate200, width:1.2}});
    // dot + title
    s.addShape(p.ShapeType.roundRect, {x:x+0.28, y:cy+0.32, w:0.14, h:0.14, rectRadius:0.07, fill:{color: c.road? C.amber : C.em500}, line:{type:'none'}});
    s.addText(c.t, {x:x+0.5, y:cy+0.22, w:cw-0.7, h:0.3, fontFace:FH, fontSize:13, bold:true, color:C.navy, charSpacing:0.6, align:'left', valign:'middle', margin:0});
    if(c.road){
      s.addShape(p.ShapeType.roundRect, {x:x+0.28, y:cy+0.62, w:1.15, h:0.26, rectRadius:0.08, fill:{color:C.white}, line:{color:C.amberBd, width:1}});
      s.addText('● DIRECTION', {x:x+0.28, y:cy+0.62, w:1.15, h:0.26, fontFace:FH, fontSize:8, bold:true, color:C.amberTx, align:'center', valign:'middle', margin:0});
    }
    const arr = c.items.map(t=>({text:t, options:{bullet:{code:'2022', indent:11}, color: c.road? '92600C' : C.slate600, breakLine:true, paraSpaceAfter:7}}));
    s.addText(arr, {x:x+0.28, y:cy+(c.road?1.05:0.75), w:cw-0.5, h:chH-1.1, fontFace:FB, fontSize:11, align:'left', valign:'top', margin:0});
  });
  s.addNotes('The direction is exhibition intelligence: management can read the performance of each show and, over time, decide which exhibitions deserve future investment. Over-time and outcome views are flagged as product direction.');
})();

// ============================================================
// SLIDE 7 — CLOSING (dark)
// ============================================================
(()=>{
  const s = p.addSlide(); s.background = {color:C.navy};
  logo(s, M, 0.5, true);

  s.addText([
    {text:'ExpoLead doesn’t replace your CRM.', options:{color:C.white, breakLine:true}},
    {text:'It owns the exhibition layer.', options:{color:C.em400}},
  ], {x:M, y:1.9, w:12, h:1.6, fontFace:FH, fontSize:36, bold:true, align:'left', valign:'top', lineSpacingMultiple:1.03, margin:0});
  s.addText('Before, during and immediately after the show. Your CRM keeps the relationship, the pipeline and the revenue.',
    {x:M, y:3.5, w:8.5, h:0.6, fontFace:FB, fontSize:15, color:'CBD5E1', align:'left', valign:'top', lineSpacingMultiple:1.15, margin:0});

  // discovery card
  s.addShape(p.ShapeType.roundRect, {x:M, y:4.4, w:PW-2*M, h:2.0, rectRadius:0.12, fill:{color:'12203A'}, line:{color:C.slate700, width:1}});
  s.addText('ASK YOUR TEAM', {x:M+0.35, y:4.6, w:6, h:0.3, fontFace:FH, fontSize:11, bold:true, color:C.em400, charSpacing:1.5, margin:0});
  const qs = [
    'Back from a show with 50 to 100 conversations, how do you manage everything from that specific exhibition?',
    'How do you separate serious opportunities from casual conversations?',
    'Six months on, can you trace a deal back to the exhibition it started at?',
  ];
  const arr = qs.map(t=>({text:t, options:{bullet:{code:'003F', indent:16}, color:'CBD5E1', breakLine:true, paraSpaceAfter:9}}));
  s.addText(arr, {x:M+0.35, y:5.0, w:PW-2*M-0.7, h:1.3, fontFace:FB, fontSize:13.5, align:'left', valign:'top', margin:0});

  s.addText('NO RIP AND REPLACE  ·  KEEP THE CRM YOU ALREADY USE',
    {x:M, y:6.7, w:12, h:0.3, fontFace:FH, fontSize:10.5, bold:true, color:C.slate500, charSpacing:1.2, align:'left', valign:'middle', margin:0});
  s.addNotes('Close on reassurance: no rip-and-replace. ExpoLead owns only the exhibition layer and complements any CRM. Use the three discovery questions to open the conversation without telling the prospect their CRM is inadequate.');
})();

p.writeFile({ fileName: OUT }).then(f=>console.log('WROTE', f)).catch(e=>{console.error(e); process.exit(1);});
