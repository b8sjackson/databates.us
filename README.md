# databates.us

The DataBates website. Static HTML, one serverless function for the quote request form, hosted on Vercel. Every push to `main` goes live in about a minute.

## Changing a page

1. `git fetch origin main` and start from it. The main branch moves between sessions.
2. `python3 build.py --check`. All six pages must read "same". If one reads "DIFFERS", someone edited that page by hand. Move the edit into its content file before going on.
3. Edit the words in `content/`. Edit the menu, the footer or the page titles in `build.py`.
4. `python3 build.py`, look at the result, commit the content file and the page together, and push.

Never edit a generated page by hand. The next build would undo it.

## What is where

| Piece | Where | Written by |
|---|---|---|
| Home, request, AI and data, license, terms, privacy | `index.html` and one folder each | `build.py`, from `content/<name>.html` |
| The head, the header and menu, the footer | `build.py` | Hand. One copy for all six pages |
| The lite demo | `demo/` | Hand. `build.py` does not touch it |
| The not-found page | `404.html` | Hand |
| Styles | `css/site.css`: the DataBates brand kit (tokens and components) plus page styles. Fonts are served from `/fonts` | Hand |
| Script | `js/site.js`: the menu, section addresses, the request form | Hand |
| The form's server side | `api/request.js`: stores the request in Supabase (`website_requests`) and, if `RESEND_API_KEY` is set, emails hello@databates.us and the visitor | Hand |
| The table | `supabase.sql`. Run once in the DataBates Supabase project | Hand |
| Clean section addresses | `vercel.json` and `SECTIONS` in `js/site.js` | Hand |

`.vercelignore` keeps `build.py`, `content/`, this file and `supabase.sql` off the public site.

## Adding a page

Add the content file, add a line to `PAGES` in `build.py`, add the address to `sitemap.xml`, then build.

## Settings in Vercel

Environment variables, Production: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the form. `RESEND_API_KEY` and `MAIL_FROM` for the email alerts, which are optional. No key is ever written in this repository.

## One rule

No analytics, no outside scripts, no outside fonts. The Privacy Notice depends on that staying true.
