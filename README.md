# databates.us

The DataBates website. Static HTML, one serverless function for the quote request form, hosted on Vercel.

- `build.py` writes every page from the approved website content. Edit the copy there, run `python3 build.py`, commit.
- `css/site.css` is the DataBates brand kit (tokens and components) plus page styles. Fonts are served from `/fonts`.
- `api/request.js` receives the form, stores it in Supabase (`website_requests`) and, if `RESEND_API_KEY` is set, emails hello@databates.us and the visitor.
- `supabase.sql` creates the table. Run it once in the DataBates Supabase project.

Vercel environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `RESEND_API_KEY`, `MAIL_FROM`.

No analytics, no outside scripts, no outside fonts. The Privacy Notice depends on that staying true.
