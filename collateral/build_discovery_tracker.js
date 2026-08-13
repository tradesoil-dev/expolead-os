const ExcelJS = require('exceljs');
const path = require('path');
const OUT = path.join(__dirname, 'ExpoLead-Discovery-Tracker.xlsx');

const NAVY='FF0F172A', EM='FF10B981', EM50='FFECFDF5', EM700='FF047857',
      SLATE50='FFF8FAFC', SLATE100='FFF1F5F9', SLATE200='FFE2E8F0',
      SLATE500='FF64748B', SLATE700='FF334155', WHITE='FFFFFFFF',
      AMBER50='FFFFFBEB', AMBERTX='FF7C5B16';

const wb = new ExcelJS.Workbook();
wb.creator = 'ExpoLead OS';

function fill(c){ return {type:'pattern', pattern:'solid', fgColor:{argb:c}}; }
function box(){ const s={style:'thin', color:{argb:SLATE200}}; return {top:s,left:s,right:s,bottom:s}; }

// =====================================================================
// SHEET 1 — HOW TO USE + CONVERSATION SCRIPT
// =====================================================================
const s1 = wb.addWorksheet('Conversation Script', {views:[{showGridLines:false}]});
s1.getColumn(1).width = 3;
s1.getColumn(2).width = 104;

let r = 2;
function line(text, opt){
  opt = opt||{};
  const cell = s1.getCell(`B${r}`);
  cell.value = text;
  cell.font = {name:'Calibri', size:opt.size||11, bold:!!opt.bold,
    color:{argb:opt.color||SLATE700}, italic:!!opt.italic};
  cell.alignment = {wrapText:true, vertical:'top'};
  if(opt.fill) cell.fill = fill(opt.fill);
  s1.getRow(r).height = opt.h || (opt.bold?20:16);
  r += (opt.gap||1);
}

line('ExpoLead OS — Investor Discovery Playbook', {bold:true, size:18, color:NAVY, h:28});
line('Fill the Discovery Tracker tab from real conversations, then transfer the numbers and best quotes onto slides 6 and 7 of the deck.', {italic:true, color:SLATE500, h:32, gap:2});

line('THE GOAL', {bold:true, size:12, color:EM700, h:22});
line('Get 8–12 named exporters on record. You are not selling yet — you are collecting evidence of demand in their own words. A quote you can put on a slide is worth more than a “yes, sounds good.”', {h:44, gap:2});

line('BEFORE THE CALL — set the frame (10 seconds)', {bold:true, size:12, color:EM700, h:22});
line('“I’m building a tool for exporters and I’m talking to people who actually work exhibitions before I build the next piece. Can I ask you about how you handle leads after a show? Not selling you anything — just want the honest picture.”', {italic:true, fill:SLATE50, h:44, gap:2});

line('THE QUESTIONS — ask in order, let them talk, capture exact words', {bold:true, size:12, color:EM700, h:22, gap:1});

const qs = [
  ['1. The last show','“Think about the last exhibition you worked. How many leads / cards did you come back with?”  → get a number.'],
  ['2. What happened next','“Walk me through what happened to those leads when you got home. Step by step.”  → this is where the pain lives. Stay quiet, let them describe the mess.'],
  ['3. The honest miss','“Roughly how many did you actually follow up with?”  → the gap between collected and followed-up is your whole problem, quantified.'],
  ['4. Current method','“What do you use today to keep track — cards, a spreadsheet, a CRM, memory?”'],
  ['5. Repeat buyers','“When you go back to the same show next year, do you remember who you met last time?”  → tees up the “met before” value.'],
  ['6. Cost of the miss','“When a good lead slips through, what does that cost you — roughly, in a deal?”  → gets them to price the pain themselves.'],
  ['7. The reaction (show it)','Show the product / the “met before” moment. “If this walked you up to a buyer already knowing their history — would you use it at your next show?”'],
  ['8. Willingness to pay','“It’ll be around $29–$99 a month. Is that a no-brainer, a maybe, or a no for you?”  → capture the real reaction, not politeness.'],
  ['9. The pilot ask','“Can I set you up before your next show and get your honest feedback?”  → a yes here is your strongest evidence.'],
  ['10. The referral','“Who else works shows the way you do that I should talk to?”  → compounds your network.'],
];
qs.forEach(([t,b])=>{
  line(t, {bold:true, color:NAVY, h:18});
  line(b, {color:SLATE700, h:38, gap:1});
});

r+=1;
line('AFTER EACH CALL — log it immediately', {bold:true, size:12, color:EM700, h:22});
line('Fill one row in the Discovery Tracker tab while it’s fresh. The single most valuable field is their exact quote — capture the words, not your paraphrase.', {h:32, gap:2});

line('WHAT GOES ON THE DECK', {bold:true, size:12, color:AMBERTX, h:22, fill:AMBER50});
line('Slide 6 count strip:  # interviewed  ·  # who called it a real, painful problem  ·  # who’d pilot or pay.', {h:20});
line('Slide 6 table:  your 4 strongest company + quote + signal rows.', {h:18});
line('Slide 7 amber card:  the one thing a conversation taught you that you did NOT expect — and what you changed because of it.', {h:32});

// =====================================================================
// SHEET 2 — DISCOVERY TRACKER
// =====================================================================
const s2 = wb.addWorksheet('Discovery Tracker', {views:[{state:'frozen', ySplit:1, showGridLines:false}]});

const cols = [
  ['Date', 12],
  ['Company', 22],
  ['Segment', 15],
  ['Contact & role', 20],
  ['How reached', 15],
  ['Leads last show', 12],
  ['# followed up', 12],
  ['Real & painful? (Y/N/partial)', 14],
  ['Their pain — EXACT quote', 44],
  ['Method today', 18],
  ['Would pilot? (Y/N)', 12],
  ['Would pay? (Y/maybe/N)', 13],
  ['Price reaction', 20],
  ['Surprise / insight', 30],
  ['Next step', 20],
  ['Status', 14],
];
s2.columns = cols.map(([h,w])=>({header:h, width:w}));

const hr = s2.getRow(1);
hr.height = 34;
hr.eachCell(c=>{
  c.fill = fill(NAVY);
  c.font = {name:'Calibri', size:10.5, bold:true, color:{argb:WHITE}};
  c.alignment = {wrapText:true, vertical:'middle', horizontal:'left'};
  c.border = box();
});

// pre-format 30 empty rows for easy entry
for(let i=2;i<=31;i++){
  const row = s2.getRow(i);
  row.height = 30;
  for(let c=1;c<=cols.length;c++){
    const cell = row.getCell(c);
    cell.border = box();
    cell.alignment = {wrapText:true, vertical:'top'};
    cell.font = {name:'Calibri', size:10, color:{argb:SLATE700}};
    if(i%2===0) cell.fill = fill(SLATE50);
  }
}

// data validation dropdowns
function dv(colLetter, list){
  for(let i=2;i<=31;i++){
    s2.getCell(`${colLetter}${i}`).dataValidation = {
      type:'list', allowBlank:true, formulae:[`"${list.join(',')}"`],
    };
  }
}
dv('C', ['Tea','Food','Chemicals','Apparel','Machinery','Other']);
dv('H', ['Y','N','Partial']);
dv('K', ['Y','N']);
dv('L', ['Y','Maybe','N']);
dv('P', ['Warm lead','Pilot agreed','Paying','Not a fit','Follow up']);

// example row (clearly marked, delete before real use)
const ex = ['e.g. 2026-08-14','[Example] Ceylon Leaf Exports','Tea','R. Fernando, Export Mgr','WhatsApp',80,6,'Y',
  '“I came back with a full booth of cards and chased maybe six. The rest just sat there until it was too late.”',
  'Spreadsheet + memory','Y','Maybe','$29 fine if it saves one deal','Cares about quantity more than unit price','Set up before ICIF','Pilot agreed'];
const exRow = s2.getRow(2);
ex.forEach((v,i)=>{
  const cell = exRow.getCell(i+1);
  cell.value = v;
  cell.font = {name:'Calibri', size:10, italic:true, color:{argb:SLATE500}};
});

// =====================================================================
// SHEET 3 — ROLLUP (auto-counts for the deck)
// =====================================================================
const s3 = wb.addWorksheet('Deck Numbers', {views:[{showGridLines:false}]});
s3.getColumn(1).width = 4;
s3.getColumn(2).width = 46;
s3.getColumn(3).width = 16;

function metric(row, label, formula, note){
  const l = s3.getCell(`B${row}`); l.value = label;
  l.font = {name:'Calibri', size:11, bold:true, color:{argb:NAVY}};
  l.alignment = {vertical:'middle'};
  const v = s3.getCell(`C${row}`); v.value = {formula};
  v.font = {name:'Calibri', size:16, bold:true, color:{argb:EM700}};
  v.alignment = {vertical:'middle', horizontal:'center'};
  v.fill = fill(EM50); v.border = box();
  s3.getRow(row).height = 30;
}
const t = s3.getCell('B2'); t.value = 'Numbers for slide 6 (auto-updates as you fill the tracker)';
t.font = {name:'Calibri', size:14, bold:true, color:{argb:NAVY}};
s3.getRow(2).height = 26;
const note = s3.getCell('B3'); note.value = 'Counts exclude the example row. Delete the example row once you add real data.';
note.font = {name:'Calibri', size:10, italic:true, color:{argb:SLATE500}};

metric(5, 'Exporters interviewed', `COUNTA('Discovery Tracker'!B3:B31)`);
metric(6, 'Called it a real, painful problem', `COUNTIF('Discovery Tracker'!H3:H31,"Y")`);
metric(7, 'Would pilot', `COUNTIF('Discovery Tracker'!K3:K31,"Y")`);
metric(8, 'Would pay (Y or Maybe)', `COUNTIF('Discovery Tracker'!L3:L31,"Y")+COUNTIF('Discovery Tracker'!L3:L31,"Maybe")`);
metric(9, 'Pilots agreed', `COUNTIF('Discovery Tracker'!P3:P31,"Pilot agreed")`);

wb.xlsx.writeFile(OUT).then(()=>console.log('WROTE', OUT));
