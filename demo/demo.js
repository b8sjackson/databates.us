/* DataBates demo tracker. Read-only. Every client, fee and task is generated here and is made up.
   Dates are built around today, so the demo never looks stale. Nothing is saved anywhere. */
(function () {
  'use strict';

  // ---------- Config (the only lines you should need to touch) ----------
  const CONFIG = {
    FIRM: 'Redbud Ledger Group',
    PRODUCT: 'Full web app',
    PRICE_LINE: 'Your copy is the Full web app: a $4,000 product fee plus about 15 hours at our hourly rate, $7,000 typical, or $5,000 on a 12-month Care membership with hosting included.',
    VIEWER: { initials: 'AM', name: 'Avery Morgan' },
    STAFF: [
      { initials: 'AM', name: 'Avery Morgan', capacity: 140 },
      { initials: 'BT', name: 'Blake Turner', capacity: 140 },
      { initials: 'CR', name: 'Casey Reyes', capacity: 120 },
      { initials: 'DS', name: 'Dana Shah', capacity: 140 },
      { initials: 'JB', name: 'Jordan Bell', capacity: 100 }
    ],
    STATUSES: ['Not Started', 'In Progress', 'Waiting on Client', 'On Hold', 'Blocked', 'In Review', 'Ready for Delivery', 'Complete'],
    SERVICES: ['Monthly Close', 'Quarterly Close', 'Annual / Tax Return', 'Sales Tax', 'Advisory / T&M'],
    DUE_SOON_DAYS: 7
  };

  // ---------- Tiny helpers ----------
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => (n < 10 ? '0' : '') + n;
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtDate = s => { const d = new Date(s + 'T12:00:00'); return MONTHS[d.getMonth()] + ' ' + d.getDate(); };
  const money = n => '$' + n.toLocaleString('en-US');
  const ym = d => d.getFullYear() + '-' + pad(d.getMonth() + 1);
  const ymLabel = s => { const [y, m] = s.split('-'); return MONTHS_LONG[+m - 1] + ' ' + y; };

  // seeded random so the demo is the same for everyone on a given day
  let seed = 20261006;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const between = (a, b) => a + Math.floor(rnd() * (b - a + 1));

  const TODAY = new Date(); TODAY.setHours(12, 0, 0, 0);
  const CUR = ym(TODAY);
  const monthShift = (n) => { const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + n, 1, 12); return ym(d); };
  const PERIODS = [monthShift(-1), CUR, monthShift(1)];
  const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);

  // ---------- Made-up firm data ----------
  const FIRST = ['Harlow', 'Prairie Ridge', 'Cedar & Vine', 'Northgate', 'Oakmont', 'Redbud', 'Larkspur', 'Lakeside', 'Foxglove', 'Juniper', 'Bluestem', 'Maple Hollow', 'Sandstone', 'Willow Creek', 'Copper Fork', 'Ironwood', 'Brightwater', 'Silver Fern', 'Pinecrest', 'Meadowlark', 'Goldfinch', 'Clearview', 'Stonebridge', 'Thistle', 'Hawthorn', 'Sycamore', 'Birchwood', 'Elmhurst', 'Cottonwood', 'Riverbend', 'Summit', 'Timberline', 'Wildflower', 'Sagebrush', 'Canyon', 'Mesa', 'Cypress', 'Driftwood', 'Dogwood', 'Fernhill', 'Granite', 'Heron', 'Kestrel', 'Lantern', 'Marigold', 'Orchard', 'Pebble', 'Quail', 'Saffron', 'Tamarack', 'Verbena', 'Wren', 'Yarrow', 'Amberfield', 'Bramble', 'Coral', 'Ember', 'Glen', 'Harbor', 'Indigo', 'Juniper Hill', 'Moss', 'Nightingale', 'Opal', 'Pinnacle'];
  const KIND = ['Dental Group', 'Orthodontics', 'Hospitality', 'Physical Therapy', 'Family Practice', 'Veterinary', 'Marketing LLC', 'Landscaping Co.', 'Catering', 'Construction', 'Law Office', 'Realty', 'Fitness', 'Auto Repair', 'Brewing Co.', 'Pediatrics', 'Logistics', 'Architects', 'Home Health', 'Coffee Roasters', 'Dermatology', 'HVAC', 'Plumbing', 'Consulting', 'Optometry', 'Studio', 'Bakery', 'Chiropractic', 'Pharmacy', 'Title Co.'];
  const STAFF_INI = CONFIG.STAFF.map(s => s.initials);

  const clients = FIRST.map((f, i) => ({ id: i + 1, name: f + ' ' + KIND[(i * 7) % KIND.length] }));
  const engagements = [];
  const tasks = [];
  let engSeq = 1, taskSeq = 1;

  function addEng(c, o) {
    const e = Object.assign({ id: 'ENG-' + pad(engSeq++), clientId: c.id, client: c.name, status: 'Active', signedEL: rnd() < 0.82 ? 'Yes' : 'Not stated', bankAccess: rnd() < 0.78 ? 'Yes' : 'No', note: '' }, o);
    if (e.owner === 'Unassigned') e.unassigned = true;
    engagements.push(e); return e;
  }
  clients.forEach((c, i) => {
    const owner = STAFF_INI[i % STAFF_INI.length];
    const r = rnd();
    if (r < 0.62) addEng(c, { category: 'CAS', service: 'Monthly Close', cadence: 'Monthly', owner, fee: between(6, 30) * 100, feeFreq: 'Monthly', budgetHrs: between(3, 12) });
    else if (r < 0.8) addEng(c, { category: 'CAS', service: 'Quarterly Close', cadence: 'Quarterly', owner, fee: between(12, 40) * 100, feeFreq: 'Quarterly', budgetHrs: between(4, 12) });
    else if (r < 0.9) addEng(c, { category: 'CAS', service: 'Annual / Tax Return', cadence: 'Annual', owner, fee: between(15, 60) * 100, feeFreq: 'Annual', budgetHrs: between(6, 16) });
    else addEng(c, { category: 'CAS', service: 'Advisory / T&M', cadence: 'Monthly', owner, fee: 0, feeFreq: 'Not Priced', budgetHrs: between(2, 8) });
    if (rnd() < 0.35) addEng(c, { category: 'CAS', service: 'Sales Tax', cadence: 'Monthly', owner: pick(STAFF_INI), fee: between(1, 4) * 100, feeFreq: 'Monthly', budgetHrs: between(1, 3) });
    if (rnd() < 0.45) addEng(c, { category: 'Payroll', service: 'Payroll', cadence: pick(['Bi-Weekly', 'Semi-Monthly', 'Monthly']), owner: pick(STAFF_INI), fee: between(2, 9) * 100, feeFreq: 'Monthly', budgetHrs: between(1, 4) });
  });
  // a few deliberately messy rows, the way a real firm has them
  engagements[3].owner = 'Unassigned'; engagements[3].signedEL = 'Not stated';
  engagements[11].note = 'On hold until the owner returns the proposal.'; engagements[11].status = 'On Hold';
  engagements[27].note = 'Needs proposal for the new entity.';
  engagements[40].owner = 'Unassigned';
  engagements[52].note = 'Offboarding at year end.'; engagements[52].status = 'Offboarding';

  function risk(e) {
    let p = 0;
    if (e.signedEL !== 'Yes') p += 2;
    if (e.owner === 'Unassigned') p += 3;
    if (e.bankAccess === 'No') p += 1;
    if (e.budgetHrs >= 15) p += 1;
    if (/on hold|offboard|needs proposal|change order|sold|disengag/i.test(e.note)) p += 3;
    return p >= 5 ? 'High' : p >= 3 ? 'Medium' : 'Low';
  }
  engagements.forEach(e => { e.risk = risk(e); });

  const BLOCKERS = ['Waiting on bank statements', 'Waiting on credit card statements', 'Open items list sent, no reply', 'Client has not sent payroll register', 'Missing vendor invoices', 'Owner out until next week'];
  const CAS_NOTES = ['', '', '', 'Reclass pending review', 'Ask about the new loan', 'Tie out inventory', 'Sales tax rate changed', 'New entity added this year'];

  function statusFor(due) {
    const d = daysBetween(iso(TODAY), due); // positive = in future
    const r = rnd();
    if (d < -20) return r < 0.9 ? 'Complete' : 'Blocked';
    if (d < 0) return r < 0.68 ? 'Complete' : r < 0.8 ? 'In Review' : r < 0.9 ? 'Waiting on Client' : r < 0.96 ? 'In Progress' : 'Blocked';
    if (d <= 7) return r < 0.35 ? 'In Progress' : r < 0.5 ? 'Waiting on Client' : r < 0.6 ? 'In Review' : r < 0.68 ? 'Ready for Delivery' : r < 0.74 ? 'Complete' : r < 0.8 ? 'On Hold' : 'Not Started';
    if (d <= 21) return r < 0.25 ? 'In Progress' : r < 0.35 ? 'Waiting on Client' : 'Not Started';
    return r < 0.1 ? 'In Progress' : 'Not Started';
  }
  function addTask(e, period, due, kind, title) {
    const status = statusFor(due);
    const t = {
      id: (kind === 'payroll' ? 'PAY-' : 'CAS-') + pad(taskSeq++).padStart(4, '0'),
      engId: e.id, client: e.client, kind, title, service: kind === 'payroll' ? title : e.service, owner: e.owner, period, due, status,
      budgetHrs: e.budgetHrs, actualHrs: 0, blocker: '', note: pick(CAS_NOTES), risk: e.risk
    };
    if (status === 'Complete') t.actualHrs = Math.max(1, Math.round(e.budgetHrs * (0.7 + rnd() * 0.6)));
    else if (status !== 'Not Started') t.actualHrs = Math.round(e.budgetHrs * rnd() * 0.8);
    if (status === 'Waiting on Client' || status === 'Blocked') t.blocker = pick(BLOCKERS);
    tasks.push(t); return t;
  }
  PERIODS.forEach(p => {
    const [y, m] = p.split('-').map(Number);
    const q = (m - 1) % 3 === 0; // quarterly closes land the month after quarter end
    engagements.forEach(e => {
      if (e.status === 'Offboarding' && p > CUR) return;
      if (e.category === 'Payroll') {
        const days = e.cadence === 'Monthly' ? [between(24, 28)] : e.cadence === 'Semi-Monthly' ? [15, 30] : [between(2, 6), between(16, 20)];
        days.forEach(d => addTask(e, p, iso(new Date(y, m - 1, Math.min(d, 28), 12)), 'payroll', 'Processing Run'));
        if (q) addTask(e, p, iso(new Date(y, m - 1, 28, 12)), 'payroll', 'Quarterly Filing');
        return;
      }
      if (e.service === 'Monthly Close' || e.service === 'Advisory / T&M') addTask(e, p, iso(new Date(y, m - 1, between(10, 25), 12)), 'cas', e.service);
      else if (e.service === 'Sales Tax') addTask(e, p, iso(new Date(y, m - 1, 20, 12)), 'cas', e.service);
      else if (e.service === 'Quarterly Close' && q) addTask(e, p, iso(new Date(y, m - 1, between(18, 28), 12)), 'cas', e.service);
      else if (e.service === 'Annual / Tax Return' && (m === 3 || m === 4 || m === 9 || m === 10)) addTask(e, p, iso(new Date(y, m - 1, between(8, 15), 12)), 'cas', e.service);
    });
  });

  function flag(t) {
    if (t.status === 'Complete') return 'Done';
    const d = daysBetween(iso(TODAY), t.due);
    if (d < 0) return 'Overdue';
    if (d <= CONFIG.DUE_SOON_DAYS) return 'Due this week';
    if (d <= 21) return 'Upcoming';
    return 'Scheduled';
  }
  const flagCls = f => ({ Overdue: 'crit', 'Due this week': 'warn', Done: 'ok', Upcoming: 'info', Scheduled: '' }[f] || '');
  const statusCls = s => ({ Complete: 'ok', 'Ready for Delivery': 'ok', Blocked: 'crit', 'Waiting on Client': 'warn', 'On Hold': 'warn', 'In Progress': 'info', 'In Review': 'solid' }[s] || '');
  const ownerName = i => (CONFIG.STAFF.find(s => s.initials === i) || {}).name || 'Unassigned';
  const ownerEl = i => '<span class="owner" style="background:var(--c-' + (i === 'Unassigned' ? 'UN' : i) + ')" title="' + esc(ownerName(i)) + '">' + (i === 'Unassigned' ? '?' : esc(i)) + '</span>';
  const pill = (txt, cls) => '<span class="pill ' + (cls || '') + '">' + esc(txt) + '</span>';

  // ---------- State ----------
  const S = { view: 'dashboard', month: CUR, mine: false, cas: { f: { month: CUR }, sort: { k: 'due', d: 1 } }, eng: { f: {}, sort: { k: 'client', d: 1 } }, cal: { y: TODAY.getFullYear(), m: TODAY.getMonth(), owner: 'all', kind: 'all', done: false } };

  // ---------- Toast and fake presses ----------
  let toastT;
  function toast(msg, ms) {
    const el = $('#toast'); el.innerHTML = msg; el.hidden = false; clearTimeout(toastT);
    toastT = setTimeout(() => { el.hidden = true; }, ms || 3200);
  }
  const FAKE = {
    add: 'Adding work is turned off in this demo. In your copy an admin adds the engagement and its tasks fill in by themselves.',
    save: 'Saving is turned off in this demo. In your copy this writes the change, logs who made it, and shows it on everyone\'s screen.',
    mode: 'The update mode is an admin setting. In your copy, one click here changes how every agent behaves.',
    approve: 'Approved. In your copy that would update the task, clear the blocker, and log who approved it.',
    reject: 'Rejected. In your copy the task stays as it was and the agent is told why.',
    edit: 'Editing is turned off in this demo. Your copy lets staff change this right here.',
    flow: 'Each workflow is scoped and priced for your firm. <a href="/request/">Ask about this one</a>.'
  };
  function press(btn, cb) {
    btn.classList.add('is-pressed'); setTimeout(() => btn.classList.remove('is-pressed'), 140);
    if (cb) cb();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fake]'); if (!b) return;
    e.preventDefault(); press(b, () => toast(FAKE[b.dataset.fake] || FAKE.edit));
  });
  document.addEventListener('change', e => {
    const el = e.target.closest('.drawer select, .drawer input, .drawer textarea'); if (!el) return;
    toast(FAKE.edit); if (el.dataset.orig != null) el.value = el.dataset.orig;
  });

  // ---------- Tabs ----------
  function show(view) {
    S.view = view;
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
    $$('.tabs [role=tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.view === view ? 'true' : 'false'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'dashboard') drawDash(); if (view === 'cas') drawCas(); if (view === 'calendar') drawCal(); if (view === 'clients') drawEng(); if (view === 'automation') drawAuto();
  }
  $$('.tabs [role=tab]').forEach(b => b.onclick = () => show(b.dataset.view));
  $('[data-scroll=missing]').onclick = e => { e.preventDefault(); $('#missing').scrollIntoView({ behavior: 'smooth' }); };
  function jump(view, f) { S.cas.f = Object.assign({}, f); S.mine = false; show(view); }

  // ---------- Dashboard ----------
  function drawDash() {
    const sel = $('#dashMonth');
    if (!sel.options.length) { sel.innerHTML = PERIODS.map(p => '<option value="' + p + '">' + ymLabel(p) + '</option>').join(''); sel.value = CUR; sel.onchange = () => { S.month = sel.value; drawDash(); }; }
    const inM = tasks.filter(t => t.period === S.month);
    const cas = inM.filter(t => t.kind === 'cas'), pr = inM.filter(t => t.kind === 'payroll');
    const open = inM.filter(t => t.status !== 'Complete');
    const over = open.filter(t => flag(t) === 'Overdue').length;
    const soon = open.filter(t => flag(t) === 'Due this week').length;
    const prog = inM.filter(t => t.status === 'In Progress').length;
    const done = inM.filter(t => t.status === 'Complete').length;
    const tiles = [
      { k: 'Open items', v: open.length, s: 'of ' + inM.length + ' this month', go: () => jump('cas', { month: S.month, open: '1' }) },
      { k: 'Overdue', v: over, s: 'past due, not complete', cls: over ? 'crit' : '', go: () => jump('cas', { month: S.month, flag: 'Overdue' }) },
      { k: 'Due this week', v: soon, s: 'within ' + CONFIG.DUE_SOON_DAYS + ' days', cls: soon ? 'warn' : '', go: () => jump('cas', { month: S.month, flag: 'Due this week' }) },
      { k: 'In progress', v: prog, s: 'being worked', go: () => jump('cas', { month: S.month, status: 'In Progress' }) },
      { k: 'Complete', v: done, s: 'marked done', cls: 'ok', go: () => jump('cas', { month: S.month, status: 'Complete' }) },
      { k: '% complete', v: inM.length ? Math.round(done / inM.length * 100) + '%' : '0%', s: done + ' of ' + inM.length, go: null }
    ];
    $('#dashTiles').innerHTML = tiles.map((t, i) => '<button class="tile ' + (t.cls || '') + '" data-i="' + i + '"><span class="k">' + t.k + '</span><span class="v">' + t.v + '</span><span class="s">' + esc(t.s) + '</span></button>').join('');
    $$('#dashTiles .tile').forEach(el => { const t = tiles[el.dataset.i]; el.onclick = t.go || (() => toast('That one is just a number.')); });

    const tot = cas.length || 1;
    $('#dashStatus').innerHTML = CONFIG.STATUSES.map(s => { const c = cas.filter(t => t.status === s).length; return '<div class="bar-row"><span>' + esc(s) + '</span><div class="track"><div class="fill ' + statusCls(s).replace('solid', 'info') + '" style="width:' + (c / tot * 100) + '%"></div></div><span class="n">' + c + '</span></div>'; }).join('');

    const n = fn => inM.filter(fn).length;
    const active = engagements.filter(e => e.status === 'Active');
    const attn = [
      ['Overdue (client work + payroll)', over, () => jump('cas', { month: S.month, flag: 'Overdue' })],
      ['Blocked', n(t => t.status === 'Blocked'), () => jump('cas', { month: S.month, status: 'Blocked' })],
      ['Waiting on client', n(t => t.status === 'Waiting on Client'), () => jump('cas', { month: S.month, status: 'Waiting on Client' })],
      ['High-risk work still open', n(t => t.status !== 'Complete' && t.risk === 'High'), () => jump('cas', { month: S.month, risk: 'High' })],
      ['No owner assigned', n(t => t.owner === 'Unassigned'), () => jump('cas', { month: S.month, owner: 'Unassigned' })],
      ['Active engagements with no engagement letter on record', active.filter(e => e.signedEL !== 'Yes').length, () => { S.eng.f = { el: 'missing' }; show('clients'); }],
      ['Active engagements with no bank access', active.filter(e => e.bankAccess === 'No').length, () => { S.eng.f = { bank: 'No' }; show('clients'); }]
    ];
    $('#dashAttn').innerHTML = attn.map((a, i) => '<button data-i="' + i + '"><span>' + esc(a[0]) + '</span><span class="cnt ' + (a[1] ? '' : 'zero') + '">' + a[1] + '</span></button>').join('');
    $$('#dashAttn button').forEach(b => b.onclick = attn[b.dataset.i][2]);

    const rows = CONFIG.STAFF.map(s => s.initials).concat(['Unassigned']).map(o => {
      const mine = inM.filter(t => t.owner === o), op = mine.filter(t => t.status !== 'Complete');
      const cap = o === 'Unassigned' ? 0 : CONFIG.STAFF.find(s => s.initials === o).capacity;
      const bud = mine.reduce((a, t) => a + t.budgetHrs, 0), act = mine.reduce((a, t) => a + t.actualHrs, 0);
      return { o, open: op.length, over: op.filter(t => flag(t) === 'Overdue').length, bud, act, cap, hr: op.filter(t => t.risk === 'High').length };
    });
    const tt = rows.reduce((a, r) => ({ open: a.open + r.open, over: a.over + r.over, bud: a.bud + r.bud, act: a.act + r.act, cap: a.cap + r.cap, hr: a.hr + r.hr }), { open: 0, over: 0, bud: 0, act: 0, cap: 0, hr: 0 });
    const util = (b, c) => c ? '<span class="util"><i class="' + (b / c > 1 ? 'crit' : b / c > .85 ? 'warn' : '') + '" style="width:' + Math.min(100, b / c * 100) + '%"></i></span>' + Math.round(b / c * 100) + '%' : '<span class="muted">n/a</span>';
    $('#dashStaff').innerHTML = '<tr><th>Staff</th><th class="n">Open</th><th class="n">Overdue</th><th class="n">Budget hrs</th><th class="n">Actual hrs</th><th class="n">Capacity</th><th>Utilization</th><th class="n">High-risk open</th></tr>' +
      rows.map(r => '<tr><td>' + ownerEl(r.o) + ' &nbsp;' + esc(ownerName(r.o)) + '</td><td class="n">' + r.open + '</td><td class="n">' + (r.over ? '<b style="color:var(--crit)">' + r.over + '</b>' : 0) + '</td><td class="n">' + r.bud + '</td><td class="n">' + r.act + '</td><td class="n">' + (r.cap || '') + '</td><td>' + util(r.bud, r.cap) + '</td><td class="n">' + r.hr + '</td></tr>').join('') +
      '<tr class="total"><td>Total</td><td class="n">' + tt.open + '</td><td class="n">' + tt.over + '</td><td class="n">' + tt.bud + '</td><td class="n">' + tt.act + '</td><td class="n">' + tt.cap + '</td><td>' + util(tt.bud, tt.cap) + '</td><td class="n">' + tt.hr + '</td></tr>';

    $('#dashService').innerHTML = '<tr><th>Service type</th><th class="n">Tasks</th><th class="n">Complete</th><th class="n">Budget hrs</th></tr>' + CONFIG.SERVICES.map(s => { const m = cas.filter(t => t.service === s); return '<tr><td>' + esc(s) + '</td><td class="n">' + m.length + '</td><td class="n">' + m.filter(t => t.status === 'Complete').length + '</td><td class="n">' + m.reduce((a, t) => a + t.budgetHrs, 0) + '</td></tr>'; }).join('');

    const pa = [['Payroll runs and filings due', pr.length, { kind: 'payroll' }], ['Not started', pr.filter(t => t.status === 'Not Started').length, { kind: 'payroll', status: 'Not Started' }], ['In progress', pr.filter(t => t.status === 'In Progress').length, { kind: 'payroll', status: 'In Progress' }], ['Overdue', pr.filter(t => flag(t) === 'Overdue').length, { kind: 'payroll', flag: 'Overdue' }], ['Complete', pr.filter(t => t.status === 'Complete').length, { kind: 'payroll', status: 'Complete' }]];
    $('#dashPayroll').innerHTML = pa.map((a, i) => '<button data-i="' + i + '"><span>' + esc(a[0]) + '</span><span class="cnt ' + (a[1] ? '' : 'zero') + '">' + a[1] + '</span></button>').join('');
    $$('#dashPayroll button').forEach(b => b.onclick = () => jump('cas', Object.assign({ month: S.month }, pa[b.dataset.i][2])));
  }

  // ---------- Client status table ----------
  function filterBar(id, defs, f, onChange) {
    const el = $(id);
    el.innerHTML = defs.map(d => d.type === 'search'
      ? '<input type="search" data-k="' + d.k + '" placeholder="' + d.ph + '" value="' + esc(f[d.k] || '') + '">'
      : '<label>' + d.label + ' <select data-k="' + d.k + '"><option value="">All</option>' + d.opts.map(o => '<option value="' + esc(o[0]) + '"' + (f[d.k] === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select></label>').join('') +
      '<button class="btn btn--sm btn--ghost" data-clear>Clear</button>';
    $$('select,input', el).forEach(i => i.oninput = () => { f[i.dataset.k] = i.value; onChange(); });
    $('[data-clear]', el).onclick = () => { Object.keys(f).forEach(k => delete f[k]); if (id === '#casFilters') f.month = CUR; onChange(true); };
  }
  const ownerOpts = CONFIG.STAFF.map(s => [s.initials, s.name]).concat([['Unassigned', 'Unassigned']]);
  function drawCas(rebuild) {
    const f = S.cas.f;
    if (rebuild !== false) filterBar('#casFilters', [
      { type: 'search', k: 'q', ph: 'Search client or note' },
      { k: 'month', label: 'Month', opts: PERIODS.map(p => [p, ymLabel(p)]) },
      { k: 'kind', label: 'Kind', opts: [['cas', 'Client work'], ['payroll', 'Payroll']] },
      { k: 'owner', label: 'Owner', opts: ownerOpts },
      { k: 'status', label: 'Status', opts: CONFIG.STATUSES.map(s => [s, s]) },
      { k: 'flag', label: 'Flag', opts: ['Overdue', 'Due this week', 'Upcoming', 'Scheduled', 'Done'].map(s => [s, s]) },
      { k: 'risk', label: 'Risk', opts: ['High', 'Medium', 'Low'].map(s => [s, s]) }
    ], f, rb => drawCas(rb === true));
    const mineBtn = $('#casMine'); mineBtn.setAttribute('aria-pressed', S.mine); mineBtn.onclick = () => { S.mine = !S.mine; drawCas(false); };
    let rows = tasks.filter(t => (!f.month || t.period === f.month) && (!f.kind || t.kind === f.kind) && (!f.owner || t.owner === f.owner) && (!f.status || t.status === f.status) && (!f.flag || flag(t) === f.flag) && (!f.risk || t.risk === f.risk) && (!f.open || t.status !== 'Complete') && (!f.q || (t.client + ' ' + t.note + ' ' + t.blocker).toLowerCase().includes(f.q.toLowerCase())) && (!S.mine || t.owner === CONFIG.VIEWER.initials));
    const srt = S.cas.sort;
    rows.sort((a, b) => { const va = a[srt.k], vb = b[srt.k]; return (va > vb ? 1 : va < vb ? -1 : 0) * srt.d; });
    const cols = [['id', 'ID'], ['client', 'Client'], ['service', 'Service'], ['owner', 'Owner'], ['due', 'Due'], ['flag', 'Flag'], ['status', 'Status'], ['budgetHrs', 'Budget hrs'], ['actualHrs', 'Actual hrs'], ['blocker', 'Blocker'], ['risk', 'Risk']];
    const head = '<thead><tr>' + cols.map(c => '<th class="sortable" data-k="' + c[0] + '">' + c[1] + (srt.k === c[0] ? '<span class="arrow">' + (srt.d > 0 ? '▲' : '▼') + '</span>' : '') + '</th>').join('') + '</tr></thead>';
    const body = rows.length ? '<tbody>' + rows.slice(0, 120).map(t => '<tr data-id="' + t.id + '"><td class="mono">' + t.id + '</td><td><b>' + esc(t.client) + '</b></td><td>' + esc(t.service) + (t.kind === 'payroll' ? ' ' + pill('Payroll', '') : '') + '</td><td>' + ownerEl(t.owner) + '</td><td>' + fmtDate(t.due) + '</td><td>' + pill(flag(t), flagCls(flag(t))) + '</td><td>' + pill(t.status, statusCls(t.status)) + '</td><td class="n">' + t.budgetHrs + '</td><td class="n">' + (t.actualHrs || '') + '</td><td class="muted">' + esc(t.blocker) + '</td><td>' + pill(t.risk, t.risk === 'High' ? 'crit' : t.risk === 'Medium' ? 'warn' : 'ok') + '</td></tr>').join('') + '</tbody>' : '<tbody><tr><td colspan="11"><div class="empty">Nothing matches. Clear a filter.</div></td></tr></tbody>';
    const tbl = $('#casTable'); tbl.innerHTML = head + body;
    $$('th.sortable', tbl).forEach(th => th.onclick = () => { if (srt.k === th.dataset.k) srt.d *= -1; else { srt.k = th.dataset.k; srt.d = 1; } drawCas(false); });
    $$('tbody tr[data-id]', tbl).forEach(tr => tr.onclick = () => openTask(tr.dataset.id));
    $('#casCount').textContent = rows.length + ' of ' + tasks.length + ' tasks shown' + (S.mine ? ' · viewing as ' + CONFIG.VIEWER.name : '') + (rows.length > 120 ? ' · first 120 listed, narrow the filters to see the rest' : '') + '. Click a column heading to sort.';
  }

  // ---------- Calendar ----------
  function drawCal() {
    const c = S.cal;
    const own = $('#calOwner'); if (!own.options.length) { own.innerHTML = '<option value="all">Everyone</option>' + ownerOpts.map(o => '<option value="' + o[0] + '">' + esc(o[1]) + '</option>').join(''); own.onchange = () => { c.owner = own.value; drawCal(); }; $('#calKind').onchange = e => { c.kind = e.target.value; drawCal(); }; $('#calDone').onchange = e => { c.done = e.target.checked; drawCal(); }; $('#calPrev').onclick = () => { c.m--; if (c.m < 0) { c.m = 11; c.y--; } drawCal(); }; $('#calNext').onclick = () => { c.m++; if (c.m > 11) { c.m = 0; c.y++; } drawCal(); }; $('#calToday').onclick = () => { c.y = TODAY.getFullYear(); c.m = TODAY.getMonth(); drawCal(); }; }
    $('#calTitle').textContent = MONTHS_LONG[c.m] + ' ' + c.y;
    $('#calLegend').innerHTML = CONFIG.STAFF.map(s => '<span><i style="background:var(--c-' + s.initials + ')"></i>' + esc(s.initials) + '</span>').join('') + '<span><i style="background:var(--crit)"></i>Overdue</span>';
    const first = new Date(c.y, c.m, 1), days = new Date(c.y, c.m + 1, 0).getDate(), lead = first.getDay();
    const byDay = {};
    tasks.filter(t => t.due.startsWith(c.y + '-' + pad(c.m + 1)) && (c.owner === 'all' || t.owner === c.owner) && (c.kind === 'all' || t.kind === c.kind) && (c.done || t.status !== 'Complete')).forEach(t => { (byDay[t.due] = byDay[t.due] || []).push(t); });
    let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => '<div class="dow">' + d + '</div>').join('');
    for (let i = 0; i < lead; i++) html += '<div class="day pad"></div>';
    for (let d = 1; d <= days; d++) {
      const k = c.y + '-' + pad(c.m + 1) + '-' + pad(d), list = byDay[k] || [];
      html += '<div class="day' + (k === iso(TODAY) ? ' today' : '') + '"><span class="d">' + d + '</span>' + list.slice(0, 4).map(t => '<button class="chip' + (t.status === 'Complete' ? ' done' : flag(t) === 'Overdue' ? ' over' : '') + '" style="background:var(--c-' + (t.owner === 'Unassigned' ? 'UN' : t.owner) + ')" data-id="' + t.id + '" title="' + esc(t.client + ' · ' + t.service) + '">' + esc(t.client) + '</button>').join('') + (list.length > 4 ? '<span class="more">+' + (list.length - 4) + ' more</span>' : '') + '</div>';
    }
    const total = Object.values(byDay).reduce((a, l) => a + l.length, 0);
    $('#cal').innerHTML = html || '';
    if (!total) $('#cal').insertAdjacentHTML('beforeend', '<div class="empty" style="grid-column:1/-1">Nothing scheduled this month in the demo. Try the months around today.</div>');
    $$('#cal .chip').forEach(b => b.onclick = () => openTask(b.dataset.id));
  }

  // ---------- Clients ----------
  function drawEng(rebuild) {
    const f = S.eng.f;
    if (rebuild !== false) filterBar('#engFilters', [
      { type: 'search', k: 'q', ph: 'Search client' },
      { k: 'category', label: 'Category', opts: [['CAS', 'Client accounting'], ['Payroll', 'Payroll']] },
      { k: 'cadence', label: 'Cadence', opts: ['Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly', 'Quarterly', 'Annual'].map(s => [s, s]) },
      { k: 'owner', label: 'Owner', opts: ownerOpts },
      { k: 'el', label: 'Engagement letter', opts: [['Yes', 'On file'], ['missing', 'Not stated']] },
      { k: 'bank', label: 'Bank access', opts: [['Yes', 'Yes'], ['No', 'No']] },
      { k: 'risk', label: 'Risk', opts: ['High', 'Medium', 'Low'].map(s => [s, s]) }
    ], f, rb => drawEng(rb === true));
    let rows = engagements.filter(e => (!f.q || e.client.toLowerCase().includes(f.q.toLowerCase())) && (!f.category || e.category === f.category) && (!f.cadence || e.cadence === f.cadence) && (!f.owner || e.owner === f.owner) && (!f.el || (f.el === 'Yes' ? e.signedEL === 'Yes' : e.signedEL !== 'Yes')) && (!f.bank || e.bankAccess === f.bank) && (!f.risk || e.risk === f.risk));
    const srt = S.eng.sort; rows.sort((a, b) => { const va = a[srt.k], vb = b[srt.k]; return (va > vb ? 1 : va < vb ? -1 : 0) * srt.d; });
    const cols = [['client', 'Client'], ['category', 'Category'], ['service', 'Service'], ['cadence', 'Cadence'], ['owner', 'Owner'], ['status', 'Status'], ['fee', 'Fee'], ['budgetHrs', 'Budget hrs/mo'], ['signedEL', 'EL'], ['bankAccess', 'Bank access'], ['risk', 'Risk']];
    const tbl = $('#engTable');
    tbl.innerHTML = '<thead><tr>' + cols.map(c => '<th class="sortable" data-k="' + c[0] + '">' + c[1] + (srt.k === c[0] ? '<span class="arrow">' + (srt.d > 0 ? '▲' : '▼') + '</span>' : '') + '</th>').join('') + '</tr></thead><tbody>' +
      (rows.length ? rows.map(e => '<tr data-id="' + e.id + '"><td><b>' + esc(e.client) + '</b></td><td>' + esc(e.category) + '</td><td>' + esc(e.service) + '</td><td>' + esc(e.cadence) + '</td><td>' + ownerEl(e.owner) + '</td><td>' + pill(e.status, e.status === 'Active' ? 'ok' : 'warn') + '</td><td>' + (e.fee ? money(e.fee) + ' <span class="muted">/ ' + e.feeFreq.toLowerCase().replace('ly', '') + '</span>' : '<span class="muted">T&amp;M</span>') + '</td><td class="n">' + e.budgetHrs + '</td><td>' + (e.signedEL === 'Yes' ? pill('On file', 'ok') : pill('Not stated', 'warn')) + '</td><td>' + (e.bankAccess === 'Yes' ? pill('Yes', 'ok') : pill('No', 'crit')) + '</td><td>' + pill(e.risk, e.risk === 'High' ? 'crit' : e.risk === 'Medium' ? 'warn' : 'ok') + '</td></tr>').join('') : '<tr><td colspan="11"><div class="empty">Nothing matches. Clear a filter.</div></td></tr>') + '</tbody>';
    $$('th.sortable', tbl).forEach(th => th.onclick = () => { if (srt.k === th.dataset.k) srt.d *= -1; else { srt.k = th.dataset.k; srt.d = 1; } drawEng(false); });
    $$('tbody tr[data-id]', tbl).forEach(tr => tr.onclick = () => openEng(tr.dataset.id));
    const fees = rows.reduce((a, e) => a + (e.feeFreq === 'Monthly' ? e.fee : e.feeFreq === 'Quarterly' ? e.fee / 3 : e.feeFreq === 'Annual' ? e.fee / 12 : 0), 0);
    $('#engCount').textContent = rows.length + ' of ' + engagements.length + ' engagements across ' + clients.length + ' clients · about ' + money(Math.round(fees)) + ' a month in recurring fees shown.';
  }

  // ---------- Drawer ----------
  function openDrawer(title, body) {
    $('#dTitle').textContent = title; $('#dBody').innerHTML = body; $('#drawer').hidden = false; $('#drawerBg').hidden = false;
    $$('#dBody select, #dBody input, #dBody textarea').forEach(el => { el.dataset.orig = el.value; });
  }
  function closeDrawer() { $('#drawer').hidden = true; $('#drawerBg').hidden = true; }
  $('#dClose').onclick = $('#dClose2').onclick = $('#drawerBg').onclick = closeDrawer;
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
  const sel = (label, val, opts) => '<label class="field"><span>' + label + '</span><select>' + opts.map(o => '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select></label>';
  const inp = (label, val, type) => '<label class="field"><span>' + label + '</span><input type="' + (type || 'text') + '" value="' + esc(val) + '"></label>';
  function openTask(id) {
    const t = tasks.find(x => x.id === id); if (!t) return;
    const e = engagements.find(x => x.id === t.engId);
    const hist = [['Today 8:12', 'agent:morning-check', 'Checked the client folder for ' + t.client + '. ' + (t.blocker ? 'Still waiting.' : 'Nothing outstanding.')], ['Yesterday 16:40', ownerName(t.owner), 'Status set to ' + t.status + (t.actualHrs ? ', ' + t.actualHrs + ' hrs logged' : '')], [ymLabel(t.period).split(' ')[0] + ' 1', 'rollover', 'Task created from the ' + t.service + ' engagement']];
    openDrawer(t.client, '<p class="muted">' + esc(t.service) + ' · ' + esc(ymLabel(t.period)) + ' · <span class="mono">' + t.id + '</span></p>' +
      '<div class="facts"><div><span>Due</span><b>' + fmtDate(t.due) + '</b></div><div><span>Flag</span>' + pill(flag(t), flagCls(flag(t))) + '</div><div><span>Owner</span><b>' + esc(ownerName(t.owner)) + '</b></div><div><span>Risk</span>' + pill(t.risk, t.risk === 'High' ? 'crit' : t.risk === 'Medium' ? 'warn' : 'ok') + '</div></div>' +
      sel('Status', t.status, CONFIG.STATUSES) + sel('Owner', ownerName(t.owner), CONFIG.STAFF.map(s => s.name).concat(['Unassigned'])) + inp('Actual hours', t.actualHrs || '', 'number') + inp('Blocker', t.blocker) +
      '<label class="field"><span>Note</span><textarea>' + esc(t.note) + '</textarea></label>' +
      '<h3>Engagement</h3><div class="sub-list"><button data-eng="' + e.id + '"><span>' + esc(e.client) + ' · ' + esc(e.service) + '</span><span class="muted">' + (e.fee ? money(e.fee) + ' / ' + e.feeFreq.toLowerCase() : 'T&amp;M') + ' →</span></button></div>' +
      '<h3>History</h3><div class="hist">' + hist.map(h => '<div><span class="t">' + h[0] + '</span><span><span class="src ' + (/agent|rollover/.test(h[1]) ? '' : 'person') + '">' + esc(h[1]) + '</span> ' + esc(h[2]) + '</span></div>').join('') + '</div>');
    $('[data-eng]', $('#dBody')).onclick = () => openEng(e.id);
  }
  function openEng(id) {
    const e = engagements.find(x => x.id === id); if (!e) return;
    const list = tasks.filter(t => t.engId === id).sort((a, b) => a.due > b.due ? 1 : -1);
    openDrawer(e.client, '<p class="muted">' + esc(e.service) + ' · ' + esc(e.cadence) + ' · <span class="mono">' + e.id + '</span></p>' +
      '<div class="facts"><div><span>Fee</span><b>' + (e.fee ? money(e.fee) + ' / ' + e.feeFreq.toLowerCase() : 'Time and materials') + '</b></div><div><span>Budget</span><b>' + e.budgetHrs + ' hrs / mo</b></div><div><span>Risk</span>' + pill(e.risk, e.risk === 'High' ? 'crit' : e.risk === 'Medium' ? 'warn' : 'ok') + '</div><div><span>Status</span>' + pill(e.status, e.status === 'Active' ? 'ok' : 'warn') + '</div></div>' +
      sel('Owner', ownerName(e.owner), CONFIG.STAFF.map(s => s.name).concat(['Unassigned'])) + sel('Engagement letter', e.signedEL, ['Yes', 'Not stated']) + sel('Bank access', e.bankAccess, ['Yes', 'No']) +
      '<label class="field"><span>Note</span><textarea placeholder="Watch-list words here raise the risk score">' + esc(e.note) + '</textarea></label>' +
      '<h3>Tasks from this engagement</h3><div class="sub-list">' + (list.map(t => '<button data-task="' + t.id + '"><span>' + fmtDate(t.due) + ' · ' + esc(t.title) + '</span>' + pill(t.status, statusCls(t.status)) + '</button>').join('') || '<p class="muted">No tasks in the months shown.</p>') + '</div>');
    $$('[data-task]', $('#dBody')).forEach(b => b.onclick = () => openTask(b.dataset.task));
  }

  // ---------- Automation ----------
  const QUEUE = [
    { id: 'CAS-0179', client: 'Larkspur Marketing LLC', src: 'agent:morning-check', when: 'Today 08:04', why: 'The item this close was waiting on landed in the client folder this morning.', diff: [['note', '—', 'Received ' + fmtDate(iso(TODAY))], ['status', 'Waiting on Client', 'In Progress'], ['blocker', 'Waiting on credit card statements', '—']] },
    { id: 'PAY-0062', client: 'Lakeside Landscaping Co.', src: 'agent:payroll-watch', when: 'Today 07:31', why: 'The payroll register came in by email. Hours match the last two runs.', diff: [['status', 'Not Started', 'In Progress'], ['note', '—', 'Register received, 14 employees']] },
    { id: 'CAS-0070', client: 'Foxglove Catering', src: 'agent:bank-feed', when: 'Yesterday 17:52', why: 'All three bank statements for the month are now in the folder.', diff: [['blocker', 'Waiting on bank statements', '—'], ['status', 'Blocked', 'In Progress']] }
  ];
  const ACTIVITY = [
    ['Today 08:04', 'agent:morning-check', 'Posted 3 proposed updates to the queue'],
    ['Today 07:45', 'agent:morning-brief', 'Emailed the day\'s overdue and due-this-week list to the CAS manager'],
    ['Yesterday 16:40', 'Avery Morgan', 'Harlow Dental Group: status In Review, 6 hrs logged'],
    ['Yesterday 15:12', 'Blake Turner', 'Prairie Ridge Orthodontics: blocker cleared'],
    ['Yesterday 14:03', 'agent:calendar-sync', 'Pushed 11 payroll run dates to the team calendar'],
    ['Yesterday 09:20', 'Dana Shah', 'Oakmont Family Practice: note added'],
    ['Mon 08:00', 'rollover', 'Copied 122 engagements into the new month, statuses reset']
  ];
  const FLOWS = [
    { icon: '☀️', name: 'Morning brief', what: 'Every weekday the manager gets one email: what is overdue, what is due this week, and who is stretched.', tag: ['Read only', 'ok'] },
    { icon: '🏦', name: 'Bank statement watcher', what: 'When a statement lands in the client folder, the blocker clears and the close moves to In Progress.', tag: ['Proposes updates', 'info'] },
    { icon: '✉️', name: 'Client nudges', what: 'Open items lists go out on a schedule, and the tracker notes when the client replies.', tag: ['Proposes updates', 'info'] },
    { icon: '📅', name: 'Payroll calendar sync', what: 'Every payroll run date shows up on the team calendar, and moves when the tracker does.', tag: ['Read only', 'ok'] },
    { icon: '🔁', name: 'Month rollover', what: 'On the first of the month, every recurring job is copied forward with a clean status and clean hours.', tag: ['Included', 'solid'] },
    { icon: '🔗', name: 'Practice management link', what: 'Your client list stays in your practice management system. The tracker mirrors it.', tag: ['Connector', ''] }
  ];
  let autoDrawn = false;
  function drawAuto() {
    if (autoDrawn) return; autoDrawn = true;
    $$('#modes .mode').forEach(b => b.onclick = () => press(b, () => toast(FAKE.mode)));
    $('#queue').innerHTML = QUEUE.map((q, i) => '<div class="q" data-i="' + i + '"><div class="q__head">' + pill('pending', 'warn') + '<b class="mono">' + q.id + '</b><span class="muted">' + esc(q.client) + '</span>' + pill(q.src, 'info') + '<span class="q__time">' + q.when + '</span></div><p>' + esc(q.why) + '</p><div class="q__diff">' + q.diff.map(d => '<span>' + d[0] + '</span><div><s class="muted">' + esc(d[1]) + '</s> → <b>' + esc(d[2]) + '</b></div>').join('') + '</div><div class="q__actions"><button class="btn btn--primary btn--sm" data-act="approve">Approve &amp; apply</button><button class="btn btn--sm btn--danger" data-act="reject">Reject</button><button class="btn btn--sm btn--ghost" data-open="' + q.id + '">Open task</button></div></div>').join('');
    $$('#queue [data-act]').forEach(b => b.onclick = () => press(b, () => {
      const card = b.closest('.q'); card.classList.add('is-done');
      $$('[data-act]', card).forEach(x => { x.disabled = true; });
      b.classList.add('is-done'); b.textContent = b.dataset.act === 'approve' ? '✓ Approved (demo)' : '✕ Rejected (demo)';
      $('.pill', card).outerHTML = pill(b.dataset.act === 'approve' ? 'approved' : 'rejected', b.dataset.act === 'approve' ? 'ok' : 'crit');
      const left = $$('#queue .q:not(.is-done)').length; $('#queueBadge').textContent = left; if (!left) $('#queueBadge').hidden = true;
      toast(FAKE[b.dataset.act] + ' Reload to reset the demo.');
    }));
    $$('#queue [data-open]').forEach(b => b.onclick = () => { const t = tasks.find(x => x.id === b.dataset.open) || tasks[0]; openTask(t.id); });
    $('#activity').innerHTML = ACTIVITY.map(a => '<div><span class="t">' + a[0] + '</span><span><span class="src ' + (/agent|rollover/.test(a[1]) ? '' : 'person') + '">' + esc(a[1]) + '</span> ' + esc(a[2]) + '</span></div>').join('');
    $('#flows').innerHTML = FLOWS.map(f => '<button class="flow"><span class="flow__icon">' + f.icon + '</span><span><b>' + f.name + '</b><p>' + f.what + '</p></span>' + pill(f.tag[0], f.tag[1]) + '</button>').join('');
    $$('#flows .flow').forEach(b => b.onclick = () => press(b, () => toast(FAKE.flow, 5000)));
  }

  // ---------- Boot ----------
  $('#appSub').textContent = CONFIG.PRODUCT + ' · Demo';
  $('#bannerPrice').textContent = CONFIG.PRICE_LINE;
  $('#userName').textContent = CONFIG.VIEWER.name;
  const want = (location.hash || '').replace('#', '');
  show(['dashboard', 'cas', 'calendar', 'clients', 'automation'].includes(want) ? want : 'dashboard');
})();
