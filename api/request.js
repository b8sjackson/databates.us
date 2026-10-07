// Receives the order request form. Stores the request in Supabase and, when a RESEND_API_KEY is set,
// emails hello@databates.us and sends the visitor the automatic reply.
const SIZES = ['1 to 10', '11 to 25', '26 to 50', '51 to 100', 'More than 100'];
const DELIVERY = ['Done for you', 'Done with you', 'Taught to you', 'Not sure yet'];
const START = ['As soon as possible', 'Within a month', 'Within three months', 'Just exploring'];
const SOURCE = ['', 'BKR conference', 'A referral', 'A university or professor', 'LinkedIn', 'Other'];

function clean(v, max) { return typeof v === 'string' ? v.trim().slice(0, max) : ''; }

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ error: 'Method not allowed' })); }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') { res.statusCode = 400; return res.end(JSON.stringify({ error: 'Bad request' })); }

  // Honeypot: real visitors never see this field.
  if (clean(body.company_website, 200)) { res.statusCode = 200; return res.end(JSON.stringify({ ok: true })); }

  const r = {
    firm: clean(body.firm, 200), name: clean(body.name, 200), role: clean(body.role, 200),
    email: clean(body.email, 320), phone: clean(body.phone, 60), size: clean(body.size, 40),
    help: Array.isArray(body.help) ? body.help.filter(x => typeof x === 'string').map(x => x.slice(0, 120)).slice(0, 20) : [],
    delivery: clean(body.delivery, 40), start: clean(body.start, 40),
    problem: clean(body.problem, 1500), source: clean(body.source, 60),
  };
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email);
  if (!r.firm || !r.name || !r.role || !emailOk || !r.phone || !SIZES.includes(r.size) || !r.help.length || !DELIVERY.includes(r.delivery) || !START.includes(r.start) || !SOURCE.includes(r.source)) {
    res.statusCode = 400; return res.end(JSON.stringify({ error: 'A required field is missing.' }));
  }

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { res.statusCode = 500; return res.end(JSON.stringify({ error: 'The form is not set up yet.' })); }

  const ins = await fetch(url.replace(/\/$/, '') + '/rest/v1/website_requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: 'Bearer ' + key, Prefer: 'return=minimal' },
    body: JSON.stringify({ ...r, user_agent: clean(req.headers['user-agent'] || '', 300) }),
  });
  if (!ins.ok) { res.statusCode = 502; return res.end(JSON.stringify({ error: 'Could not save the request.' })); }

  // Email, when a provider key is present. The site works without it; requests still land in the table.
  const resend = process.env.RESEND_API_KEY;
  if (resend) {
    const from = process.env.MAIL_FROM || 'DataBates <hello@databates.us>';
    const lines = [
      `Firm: ${r.firm}`, `Name: ${r.name}`, `Role: ${r.role}`, `Email: ${r.email}`, `Phone: ${r.phone}`, `Firm size: ${r.size}`,
      `Help with: ${r.help.join('; ')}`, `Delivery: ${r.delivery}`, `Start: ${r.start}`, `Source: ${r.source || '(not given)'}`,
      '', 'Problem:', r.problem || '(not given)',
    ].join('\n');
    const first = r.name.split(/\s+/)[0] || 'there';
    const send = (msg) => fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + resend }, body: JSON.stringify(msg) }).catch(() => null);
    await Promise.all([
      send({ from, to: ['hello@databates.us'], reply_to: r.email, subject: `Quote request: ${r.firm}`, text: lines }),
      send({ from, to: [r.email], subject: 'We received your request', text: `Hi ${first},\n\nThanks for reaching out to DataBates. Your request is in, and I will reply with a quote or a couple of questions.\n\nIf anything changes in the meantime, just reply to this email.\n\nJackson Bates\nDataBates LLC\njackson.bates@databates.us` }),
    ]);
  }
  res.statusCode = 200; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok: true }));
};
