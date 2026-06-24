# For Abhishekh — the "why" behind the work

This is the teaching companion to `DEVLOG.md`. The devlog says *what* changed; this file says
*why*, *what almost happened instead*, and *what to steal for next time*. Plain language, like a
friend explaining over coffee. Newest entry on top.

---

## 2026-06-24 — Unbreaking the site, reshaping the UI, and setting up our memory

Big day. We pulled new code, the site wouldn't load, we fixed it, then made the job pages look
good and added real sections to the job detail page. Here's the whole story.

### 1. What approach did I take, and why?

When you said "pull," my first instinct wasn't to type `git pull` and hope. It was to **look before
leaping**: check which branch we're on, what remotes exist, and whether the working tree is clean.
Think of it like checking your mirrors before changing lanes. Good thing too — I noticed you have
*two* remotes (`origin` = your fork, `upstream` = the original repo). If I'd pulled blindly from the
wrong one, we could've mixed two different histories together.

The pull itself was clean (a "fast-forward" — more on that later). But then the app exploded with a
parsing error. My approach there was **read the actual error, don't guess**. The error pointed at
`layout.tsx` line 25 with `<<<<<<< Updated upstream`. That's a fingerprint. The moment I saw it, I
knew this wasn't a pull problem at all — it was leftover **merge conflict markers** from an earlier
`git stash pop`. So I grepped the whole project for those markers to find *every* wound, not just
the first one. Found two files bleeding: `layout.tsx` and `globals.css`.

### 2. What other approaches did I consider but abandon?

- **"Just delete the confusing lines and move on."** Tempting, fast, and *wrong*. A conflict has two
  sides — keeping the incorrect side would've left the app looking broken (wrong fonts, wrong colors)
  even though it compiled. The roads-not-taken lesson: *making the error message disappear is not the
  same as fixing the problem.*
- **"Keep the `Updated upstream` (Royal-Blue) side"** since it was the "official upstream" version.
  I rejected it after reading the *rest* of the file. The unconflicted parts already referenced
  `--color-forest-teal`, a green glow, serif blockquotes — the whole file was built around the
  *other* side (the parchment/green "Workable" theme). Choosing Royal-Blue would've been like
  patching half a car with parts from a different model. So I kept the Stashed side because it was
  *internally consistent* with everything around it.
- **`git merge --abort` / re-stash dance.** Overkill. The conflict markers were already sitting in
  the files as plain text; there was no active merge to abort. Resolving by hand was the most direct
  path.

### 3. How do the parts connect?

There's a clear chain: **diagnose → resolve every instance → verify → only then build on top.**
I didn't touch the job-card redesign until the conflict was fully gone and both servers returned
200. Why that order? Because building features on a broken foundation means you can't tell if *your*
new code broke something or if it was already broken. Stabilize first, then decorate.

Later, the homepage section moves, the card redesign, and the job-detail sections all share one
backbone: **the component is the unit of change.** Move `<MobileJobSearch />`, reshape `JobCard`,
add sections inside `JobDetailsClient`. Each is a self-contained Lego brick, so rearranging them is
low-risk.

### 4. What tools/methods did I use, and why those?

- **`grep` for conflict markers** instead of eyeballing files. When something can hide in multiple
  places, search exhaustively — don't trust your eyes to catch all of them.
- **`curl` against the running servers** to confirm HTTP 200 after each change. This is the cheap,
  honest test: does the page actually load? It caught nothing scary today, but it's the seatbelt.
- **Stretched-link pattern** for the clickable job card (an invisible link covering the whole card,
  with the company name link layered on top). Why not wrap the entire card in one `<a>`? Because you
  can't legally put a link *inside* a link in HTML — the company-name link would break. The stretched
  overlay is the clean trick that lets "click anywhere" and "click the company" coexist.
- **Auto-generated FAQs** from the job's own data instead of inventing a database field. We already
  *had* the salary, location, deadline, remote/on-site flag — so I turned facts we already store into
  questions and answers. Zero backend work for real value.

### 5. What tradeoffs did I make?

- **FAQs: speed vs. control.** Auto-generated FAQs ship today with no backend change — but employers
  can't write their *own* custom questions yet. I chose the instant win and flagged the upgrade path
  (add a `faqs` field) so you can decide later. Cost: less flexibility now. Benefit: value in minutes.
- **"About the Company" section vs. the data we have.** We only store name/logo/website/location —
  no company bio paragraph. I built the section with what exists rather than blocking on a backend
  change. Cost: it's a bit thin until a `companyDescription` field is added.
- **Excluding `server/logs/combined.log` from commits.** Tiny but important: that file changes every
  time the server runs. Committing it would pollute history with noise. I prioritized a clean,
  meaningful git history over "just add everything."

### 6. What mistakes/dead ends did we hit?

- The **homepage had corrupted text** — `No繁琐 forms` (random Chinese characters spliced into an
  English sentence, probably a bad copy-paste or autocomplete accident). Easy to miss because it
  *looks* like styled text at a glance. Fixed it to "No lengthy forms."
- The job-detail page throws a **server-side error in `sanitizeHtml`** (the HTML cleaner needs a
  browser, and there's no browser on the server). The page still loads because Next.js quietly falls
  back to rendering it in the browser. I *didn't* fix it because it was pre-existing and not part of
  your ask — but I flagged it loudly rather than letting it hide. The mess lesson: *a page returning
  200 doesn't mean nothing's wrong under the hood.*

### 7. Pitfalls to watch out for next time

- **A "fast-forward" pull means no conflicts — but a leftover `stash pop` can still poison your
  files.** Don't assume "pull worked" equals "everything's clean." If something breaks right after,
  grep for `<<<<<<<` before anything else.
- **Conflict markers come in pairs across a whole file.** Fix one, search for the rest. There were
  *seven* marker groups across two files today.
- **When resolving a conflict, let the surrounding code vote.** The correct side is usually the one
  that matches the variables, colors, and patterns already used elsewhere in the file.
- **Don't commit log files or build artifacts.** Set up `.gitignore` so you're not relying on
  remembering to skip them.

### 8. What would an expert notice that a beginner misses?

- A beginner sees "parsing error on line 25" and stares at line 25. An expert recognizes the
  `<<<<<<<` shape instantly and knows the real fix is somewhere else entirely — it's a *git* problem
  wearing a *syntax-error* costume.
- A beginner picks the "upstream/official" side of a conflict by default. An expert reads the whole
  file and picks the side that keeps the code *coherent*.
- A beginner thinks "it loads, so it's fixed." An expert checks the server logs and notices the
  silent SSR crash that the browser is papering over.

### 9. Lessons that transfer to any project

- **Diagnose before you treat.** The first error message is a symptom, not the disease. (True for
  code, cars, bodies, and businesses.)
- **Consistency is a compass.** When you're unsure which option is right, choose the one that fits
  the system already in place. Coherence beats "technically newer."
- **Use what you already have before building something new.** The FAQ section created real value
  from data we were already storing. Look for the asset hiding in plain sight before you build.
- **Keep your history clean.** Whether it's git commits or your own notes, signal-to-noise matters —
  future-you (or your friend who clones the repo) will thank you.
- **Surface the mess, don't bury it.** Flagging the pre-existing SSR bug costs a sentence now and
  saves hours of confusion later.

---

*Format for future entries: `## YYYY-MM-DD — <task>` on top, walk the same 9 steps, keep it human.*
