# 📄 Snapwise — PRD v0.2 (Engine Hardening Edition)

---

## Product Name

Snapwise

## Version

0.2 — Engine Hardening Phase

## Status

Active Development

---

# 1. Executive Summary

Snapwise extracts actionable intent from screenshots and classifies them into structured categories.

Version 0.2 focuses on strengthening classification robustness through analytics, score introspection, and batch dataset evaluation before UI investment.

Primary goal:
Improve engine accuracy and reduce unsorted classification rate.

---

# 2. Current Capabilities

### OCR Pipeline

* Image preprocessing (grayscale, normalize, sharpen)
* Tesseract OCR (English)
* Noise cleaning

### Classification Engine (Rule-Based)

* Weighted keyword scoring
* Threshold-based category selection
* Categories:

  * watch_later
  * listen_later
  * read_later
  * saved_links
  * events
  * unsorted

### Persistence

SQLite storage of:

* extractedText
* category
* confidence
* timestamp

### Batch Processing

Supports multiple image upload (up to 20 per request)

---

# 3. New Additions in v0.2

## 3.1 Confidence Histogram

System must bucket classifications into:

* 0–3 → Below threshold
* 4–6 → Weak signal
* 7–10 → Strong signal
* 10+ → Very strong signal

Purpose:
Detect signal strength distribution.

---

## 3.2 Score Breakdown Logging

Classification response must include:

```json
{
  category,
  confidence,
  scoreBreakdown: {
    watch_later: X,
    listen_later: Y,
    read_later: Z,
    saved_links: A,
    events: B
  }
}
```

Purpose:
Identify confusion pairs and false positive patterns.

---

## 3.3 False Positive Analysis

Analytics must support:

* Category confusion detection
* Overclassification detection
* Weak threshold identification

---

## 3.4 LLM Benchmark (Internal Only)

Goal:
Compare rule-based classification accuracy against single LLM classification call.

Not part of production.
Used only for internal benchmarking.

---

# 4. Validation Metrics

Primary KPI:
Unsorted rate < 25%

Secondary KPIs:
Average confidence ≥ 6
Balanced category distribution
Minimal confusion between listen_later and events

---

# 5. Non-Goals (Still)

* No metadata extraction
* No automation integrations
* No external OCR API
* No ML classifier in production
* No UI polish investment

---

# 6. Hybrid Architecture Roadmap

Future logic:

If rule confidence < threshold:
→ ML fallback classifier

Current state:
Rule-only with diagnostic instrumentation.

---

# 7. Risk Assessment

Major risks:

* OCR noise affecting scoring
* Overlapping keyword sets
* Threshold miscalibration
* Rule bias toward high-frequency keywords

Mitigation:
Score breakdown + histogram + dataset expansion.

---

# 8. Exit Criteria for Engine Phase

Engine hardening phase ends when:

* ≥ 80% correct classification on 100 screenshot test dataset
* Unsorted < 20%
* No dominant confusion pair (> 15%)

Only after this:
Move to UI + feedback loop.

---

That’s your updated PRD.

Now let’s harden.

---

# 🧠 ENGINE HARDENING PLAN (Step-by-Step)

We now do 4 upgrades.

---

## 🔥 STEP 1 — Add Score Breakdown (Critical)

Modify `classify()` to return full score map.

Inside intentEngine.js, change:

```js
return {
  category: highestScore >= 4 ? bestCategory : "unsorted",
  confidence: highestScore
};
```

To:

```js
return {
  category: highestScore >= 4 ? bestCategory : "unsorted",
  confidence: highestScore,
  scoreBreakdown: scores
};
```

Now you can see internal logic.

---

## 🔥 STEP 2 — Add Confidence Histogram Endpoint

Add new route:

`GET /analytics/histogram`

We bucket confidences.

In db.js add:

```js
function getConfidenceBuckets(callback) {
  db.all(
    `
    SELECT
      CASE
        WHEN confidence < 4 THEN '0-3'
        WHEN confidence BETWEEN 4 AND 6 THEN '4-6'
        WHEN confidence BETWEEN 7 AND 10 THEN '7-10'
        ELSE '10+'
      END as bucket,
      COUNT(*) as count
    FROM screenshots
    GROUP BY bucket
    `,
    [],
    callback
  );
}
```

Export it.

Then in index.js:

```js
app.get("/analytics/histogram", (req, res) => {
  getConfidenceBuckets((err, data) => {
    if (err) return res.status(500).json({ error: "Failed" });
    res.json(data);
  });
});
```

Now you see strength distribution.

---

## 🔥 STEP 3 — Log Confusion Pairs

Add runner-up detection.

Modify classify():

Before selecting bestCategory:

```js
let sortedScores = Object.entries(scores)
  .sort((a, b) => b[1] - a[1]);

const [topCategory, topScore] = sortedScores[0];
const [secondCategory, secondScore] = sortedScores[1];
```

Return:

```js
secondBest: {
  category: secondCategory,
  score: secondScore
}
```

Now you know when:

listen_later = 8
events = 7

That’s confusion territory.

---

## 🔥 STEP 4 — Build Dataset

Upload 50 screenshots.

Real ones.

Then analyze:

* % unsorted
* Histogram spread
* Frequent confusion pairs

That’s how we tune.

---
