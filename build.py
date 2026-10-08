#!/usr/bin/env python3
"""Builds the six pages of databates.us.

    python3 build.py           write every page
    python3 build.py --check   write nothing; say whether the pages on disk match

How it fits together
- Each page's words live in content/<name>.html. That is the part between the
  header and the footer. Edit the copy there.
- The parts every page shares (the <head>, the header and menu, the footer) live
  in this file, once. Change the menu or the footer here and every page gets it.
- This script joins them and writes index.html, request/index.html and so on.

Rules
- Never edit a generated page by hand. The next build would undo it. Edit the
  content file, then build.
- Run --check before you start. If it reports a difference, someone edited a
  page directly. Move that edit into the content file first.
- /demo/ and 404.html are written by hand. This script does not touch them.

No dependencies. Python 3.8 or newer.
"""
import html
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://databates.us"
e = html.escape

NOTICE = "DataBates LLC is not a CPA firm and does not provide audit, tax or attest services."
YEAR = "2026"

# The menu. Section links are clean addresses: vercel.json sends each one to the
# home page and js/site.js scrolls to the matching section.
NAV = [
    ("/products/", "Products"),
    ("/how/", "How it works"),
    ("/about/", "About"),
    ("/contact/", "Contact"),
]

# (address, content file, title, description). Also listed in sitemap.xml.
PAGES = [
    ("/", "home",
     "DataBates: AI systems for accounting firms",
     "Trackers, dashboards and workflow automation, built for your firm by someone who has worked inside one."),
    ("/request/", "request",
     "Request a quote: DataBates",
     "Tell us what you need. We reply with a quote or a few questions. Nothing is charged here."),
    ("/ai-and-data/", "ai-and-data",
     "Your data and AI, in plain terms: DataBates",
     "Where a client's data lives, who can see it, where AI is involved and how a firm leaves."),
    ("/license/", "license",
     "License summary: DataBates",
     "What a DataBates client owns, what is licensed, and what happens when a membership ends."),
    ("/terms/", "terms",
     "Website Terms: DataBates",
     "The terms for using databates.us."),
    ("/privacy/", "privacy",
     "Privacy Notice: DataBates",
     "What databates.us collects, why, who sees it and what you can ask us to do."),
]


def head(title, desc, path, extra=""):
    canonical = SITE + path
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:type" content="website">
<meta property="og:image" content="{SITE}/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#faf8f3">
<link rel="icon" href="/img/favicon-32.png" sizes="32x32">
<link rel="icon" href="/img/Logo_Monogram.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/img/icon-180.png">
<link rel="preload" href="/fonts/Tinos-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css">
{extra}
</head>
<body>
"""


def header():
    nav = "".join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV)
    return f"""<header class="header">
  <div class="wrap header__inner">
    <a href="/" aria-label="DataBates home"><img class="wordmark-img" src="/img/Logo_Wordmark_Royal.svg" alt="DataBates" width="152" height="26"></a>
    <nav aria-label="Main"><ul class="nav">{nav}</ul></nav>
    <div class="header__actions">
      <a class="btn btn--primary btn--small" href="/request/">Request a quote</a>
      <button class="btn btn--secondary btn--small menu-btn" type="button" aria-expanded="false" aria-controls="drawer" data-menu>Menu</button>
    </div>
  </div>
  <nav class="drawer" id="drawer" aria-label="Main, phone" data-drawer>
    <div class="wrap"><ul>{nav}<li><a href="/request/">Request a quote</a></li></ul></div>
  </nav>
</header>
"""


def footer():
    return f"""<footer class="footer" id="footer">
  <div class="wrap">
    <hr class="footer__rule">
    <div class="footer__top">
      <div>
        <img src="/img/Logo_Wordmark_White.svg" alt="DataBates" width="140" height="24" style="display:block;height:24px;width:auto">
        <p class="footer__tag">In good order.</p>
      </div>
      <div>
        <ul class="footer__cols">
          <li><a href="mailto:hello@databates.us">hello@databates.us</a></li>
          <li>Norman, Oklahoma</li>
          <li><a href="https://www.linkedin.com/in/jackson-b8s" rel="noopener" target="_blank">Jackson Bates on LinkedIn</a></li>
        </ul>
        <ul class="footer__cols" style="margin-top:12px">
          <li><a href="/terms/">Terms</a></li>
          <li><a href="/privacy/">Privacy</a></li>
          <li><a href="/ai-and-data/">AI and data</a></li>
          <li><a href="/license/">License summary</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <p>{NOTICE}</p>
      <p>&copy; {YEAR} DataBates LLC, an Oklahoma limited liability company.</p>
    </div>
  </div>
</footer>
<script src="/js/site.js" defer></script>
</body>
</html>
"""


def out_path(path):
    if path == "/":
        return os.path.join(ROOT, "index.html")
    return os.path.join(ROOT, path.strip("/"), "index.html")


def render(path, name, title, desc):
    with open(os.path.join(ROOT, "content", name + ".html"), encoding="utf-8", newline="") as f:
        body = f.read()
    return head(title, desc, path) + header() + body + footer()


def main(argv):
    check = "--check" in argv
    unknown = [a for a in argv if a != "--check"]
    if unknown:
        print(__doc__)
        return 2
    differ = []
    for path, name, title, desc in PAGES:
        out = out_path(path)
        new = render(path, name, title, desc)
        old = None
        if os.path.exists(out):
            with open(out, encoding="utf-8", newline="") as f:
                old = f.read()
        rel = os.path.relpath(out, ROOT)
        if old == new:
            print("same   ", rel)
            continue
        differ.append(rel)
        if check:
            print("DIFFERS", rel)
            continue
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8", newline="") as f:
            f.write(new)
        print("wrote  ", rel)
    if check and differ:
        print("\nThe pages above do not match the content files. Someone edited a page by hand,")
        print("or a content file changed and the site was not rebuilt. Sort that out before building.")
        return 1
    if check:
        print("\nAll six pages match. Safe to edit content/ and build.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
