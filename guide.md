# 🎯 PROJECT: Screenshot Intelligence – Web Validation v0.1

Goal:
Upload screenshot → Extract text → Classify intent → Show clean structured output

---

# 🔹 PHASE 0 – Foundation (Day 1)

## 🤖 AI Tool

Prompt it:

> Generate a minimal Express server with:
>
> * File upload endpoint using multer
> * Static file serving for frontend
> * CORS enabled
> * Clean folder structure

You paste into `/server/index.js`

Run:

```
node server/index.js
```

If server runs → proceed.

---

# 🔹 PHASE 1 – OCR Pipeline (Day 2)

### 🧠 You:

Prompt AI:

> Create an OCR service using tesseract.js that:
>
> * Accepts image path
> * Extracts text
> * Returns raw text as JSON
> * Handles async properly
> * Includes error handling

Place it in:

```
/server/ocrService.js
```

Then ask AI:

> Connect OCR service to upload endpoint

Now test:
Upload image → console logs extracted text.

If that works?
Core brain pipeline is alive.

---

# 🔹 PHASE 2 – Intent Engine (Day 3–4)

This is where YOU matter.

Before touching AI, you define logic spec.

Create this file manually:

```
/engine/intentRulesSpec.md
```

Inside write:

Categories:

* watch_later
* read_later
* buy_later
* events
* links
* unsorted

Then define triggers.

Example:

WATCH_LATER:

* contains: Netflix, Season, Episode, Trailer, IMDb

BUY_LATER:

* contains: ₹, $, Buy Now, Add to Cart, OFF

EVENTS:

* regex for dates
* regex for time (PM, AM, 24hr format)

LINKS:

* contains http, https, www

READ_LATER:

* contains Medium, Blog, Article, Substack

UNSORTED:

* fallback

---

### 🤖 AI Tool:

Prompt:

> Convert this rule spec into a modular JS intent engine.
> Each parser must return:
> {
> category,
> confidence,
> metadata
> }
> Then combine scores and return best category.

It generates:

```
/engine/urlParser.js
/engine/priceParser.js
/engine/dateParser.js
/engine/mediaParser.js
/engine/intentEngine.js
```

You paste.

---

Then connect:

OCR result → IntentEngine → JSON response.

Now upload returns:

```
{
  extractedText: "...",
  category: "buy_later",
  confidence: 0.82
}
```

Now we’re cooking.

---

# 🔹 PHASE 3 – Clean Minimal UI (Day 5)

Remember: B – Minimal but Clean.

Design rule:

White background
Soft gray cards
System font
No animations
Clear category sections

---

### 🧠 You:

Prompt AI:

> Generate minimal clean HTML + CSS frontend that:
>
> * Has centered upload card
> * Shows categorized results
> * Displays extracted key text
> * Uses simple card layout
> * Mobile responsive

Paste into `/frontend/index.html`

No frameworks.
No React.
No Tailwind.
Keep it simple.

---

# 🔹 PHASE 4 – Persistence (Optional Day 6)

If needed:

Prompt AI:

> Create SQLite schema for storing:
>
> * image path
> * extracted text
> * category
> * metadata JSON
> * createdAt

Then:
Add endpoint:
GET /history

Now it behaves like an app.

---

# 🔹 PHASE 5 – Testing (Day 7)

You:

1. Install ngrok
2. Expose localhost
3. Send to 5–10 people

Ask them:

* Would you use this?
* What category feels wrong?
* Would you want this auto-connected to phone?

Observe.

Do not defend.
Just watch.

---

# 🧠 What This Achieves

In 7 days you get:

• Working intelligence engine
• OCR validation
• Real screenshot data
• Category tuning feedback
• Clear signal on idea viability

Without:

• Flutter
• Swift
• Mobile builds
• App store headache

---

# ⚠️ Important Discipline

You are NOT allowed to:

* Add animations
* Add dark mode
* Add login
* Add cloud sync
* Add branding polish

Those are ego distractions.

We validate intelligence.

---

# 📈 After Validation

If response is strong:

Then we:

Option A:
Wrap it in Flutter as thin mobile client

Option B:
Turn backend into API and build proper product

Option C:
Add Chrome extension ingestion

But that comes later.

---