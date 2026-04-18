# drunkards.in — Complete Setup Guide
## From Zero to Live Automated Blog

---

## WHAT YOU NOW HAVE

All files are ready. Your complete project includes:

```
drunkards/
├── hugo.toml                          ← Site configuration
├── netlify.toml                       ← Hosting + deploy config
├── package.json                       ← Node dependencies
├── .github/
│   └── workflows/
│       └── daily-post.yml             ← GitHub Actions (runs daily 8AM IST)
├── scripts/
│   ├── generate-post.js               ← Claude API content generator
│   └── topics.json                    ← 60 pre-loaded topic queue
├── content/
│   ├── _index.md
│   ├── posts/                         ← Auto-generated posts go here
│   ├── guides/
│   ├── india-picks/
│   ├── home-bar/
│   └── tools/
├── layouts/                           ← All page templates
├── static/
│   ├── robots.txt                     ← All AI crawlers allowed
│   ├── llms.txt                       ← AI discovery file
│   └── css/main.css
└── assets/css/main.css
```

---

## STEP 1: Install Hugo on Your Mac

Open Terminal and run:

```bash
brew install hugo
```

If you don't have Homebrew installed first run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Verify Hugo installed:
```bash
hugo version
```

---

## STEP 2: Download the Project Files

Download the zip file I've provided. Extract it. You'll have a folder called `drunkards`.

---

## STEP 3: Test Locally

In Terminal, navigate to the project folder:

```bash
cd path/to/drunkards
hugo server
```

Open your browser and go to: `http://localhost:1313`

You should see your site live locally. If you see it — everything is working.

Press `Ctrl+C` to stop the local server.

---

## STEP 4: Create a GitHub Repository

1. Go to github.com and log into your account
2. Click the **+** button (top right) → **New repository**
3. Name it: `drunkards-in`
4. Set it to **Public** (required for free GitHub Actions minutes)
5. Do NOT add README or .gitignore — leave them unchecked
6. Click **Create repository**

---

## STEP 5: Push Your Code to GitHub

In Terminal, inside your drunkards folder:

```bash
git init
git add .
git commit -m "Initial commit: drunkards.in"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/drunkards-in.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## STEP 6: Connect to Netlify

1. Go to **netlify.com** and sign up (free) — sign up with your GitHub account
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub**
4. Select your `drunkards-in` repository
5. Build settings will auto-detect from your `netlify.toml`:
   - Build command: `hugo --minify`
   - Publish directory: `public`
6. Click **Deploy site**

Netlify will build and deploy your site. It'll give you a URL like `https://quirky-name-123.netlify.app` — your site is now live.

---

## STEP 7: Connect Your GoDaddy Domain

**In Netlify:**
1. Go to **Site configuration** → **Domain management**
2. Click **Add custom domain**
3. Enter: `drunkards.in`
4. Netlify will show you DNS records to add

**In GoDaddy:**
1. Log into GoDaddy → My Products → Domains → drunkards.in → DNS
2. Delete any existing A records for `@`
3. Add the records Netlify shows you:
   - Type: `A`, Name: `@`, Value: Netlify's IP address
   - Type: `CNAME`, Name: `www`, Value: your Netlify subdomain
4. Save changes

DNS propagation takes 15 minutes to 48 hours. After that, `drunkards.in` will load your site.

Netlify automatically provides free SSL (https) — no setup needed.

---

## STEP 8: Get Your Claude API Key

1. Go to **console.anthropic.com**
2. Sign up with your email (separate from your Claude Pro account)
3. Go to **API Keys** → **Create Key**
4. Copy the key — it starts with `sk-ant-...`
5. Add credits: Go to **Billing** → Add ₹2,000 worth of credits to start

---

## STEP 9: Add API Key to GitHub Secrets

This keeps your API key secure — it's never visible in your code.

1. Go to your GitHub repo (`github.com/YOUR_USERNAME/drunkards-in`)
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: paste your API key
6. Click **Add secret**

---

## STEP 10: Test the Automation

1. Go to your GitHub repo → **Actions** tab
2. Click on **Daily Content Generation**
3. Click **Run workflow** → **Run workflow** (green button)
4. Watch it run — takes about 60–90 seconds
5. Check your `content/posts/` folder in GitHub — a new `.md` file should appear
6. Netlify will auto-detect the commit and rebuild your site within 2 minutes

If this works — your entire pipeline is live. Every morning at 8 AM IST, a new post will be written, committed, and published automatically.

---

## STEP 11: Register with Google and Bing

Once your domain is live:

**Google Search Console:**
1. Go to search.google.com/search-console
2. Add property → enter `https://drunkards.in`
3. Verify ownership (Netlify makes this easy via DNS)
4. Submit your sitemap: `https://drunkards.in/sitemap.xml`

**Bing Webmaster Tools:**
1. Go to bing.com/webmasters
2. Add your site
3. Submit sitemap: `https://drunkards.in/sitemap.xml`

This is critical — Bing powers ChatGPT and Perplexity search results.

---

## MONTHLY COSTS SUMMARY

| Item | Cost |
|---|---|
| Netlify hosting | ₹0 |
| GitHub Actions | ₹0 |
| Hugo | ₹0 |
| Claude API (Haiku, 30 posts) | ~₹65 |
| Domain (amortized) | ~₹80 |
| **Total** | **~₹145/month** |

---

## YOUR 60-TOPIC QUEUE

Your `scripts/topics.json` already has 60 topics loaded covering:
- Cocktail recipes (Negroni, Mojito, Old Fashioned, Margarita...)
- India buying guides (best gin, whisky, rum under various price points)
- Educational guides (what is vermouth, ABV, bitters, jigger...)
- Home bar guides (tools, glassware, ice)

Topics publish in order. When all 60 are done, it cycles back. You can add more topics to the JSON file anytime.

---

## TROUBLESHOOTING

**Hugo server shows blank page:** Check that `content/_index.md` exists.

**GitHub Actions fails:** Go to Actions tab, click the failed run, read the error. Most common issue is the API key secret not being set correctly.

**Netlify build fails:** Check the build log in Netlify dashboard. Usually a Hugo version mismatch — update the version in `netlify.toml`.

**Domain not resolving:** DNS propagation can take up to 48 hours. Wait and try again.

---

## NEXT STEPS AFTER SETUP

1. Add 20 more topics to `topics.json` based on your content strategy
2. Build the remaining tools (ABV calculator, home bar checklist)
3. Write 5–10 pillar pages manually — these are your most important pages and deserve extra care
4. Apply for Amazon Associates India affiliate programme (amazon.in/associates)
5. Apply for Google AdSense once you have 20+ posts live
