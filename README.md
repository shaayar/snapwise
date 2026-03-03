# Snapwise

Snapwise is an intelligence engine that extracts actionable intent from screenshots and classifies them into structured categories such as:

- watch_later
- listen_later
- read_later
- saved_links
- events
- unsorted

This version focuses on building and hardening the core classification engine before UI and automation layers.

---

## 🚀 Current Status

Version: v0.2 — Engine Hardening Phase  
Environment: Node.js + Express (local)  
Storage: SQLite (file-based)  
OCR: Tesseract.js with preprocessing  

---

## 🧠 How It Works

### 1️⃣ Upload
User uploads one or more screenshots via web interface.

### 2️⃣ Image Preprocessing
Using `sharp`:
- Grayscale
- Normalize
- Sharpen

Improves OCR accuracy.

### 3️⃣ OCR Extraction
Using `tesseract.js` to extract raw text.

### 4️⃣ Noise Cleaning
- Normalize case
- Remove unwanted characters
- Apply safe OCR corrections

### 5️⃣ Rule-Based Classification
Weighted scoring engine detects intent using:

- Explicit keywords
- Structured patterns (e.g. `Movie: Title (2009)`)
- Fuzzy keyword matching
- Date and time regex detection

### 6️⃣ Confidence Evaluation
Each category receives a score.
Final classification requires score ≥ threshold.

Response includes:
- category
- confidence
- scoreBreakdown
- secondBest
- scoreGap

### 7️⃣ Persistence
Each processed screenshot is stored in SQLite:

Table: `screenshots`

Fields:
- id
- extractedText
- category
- confidence
- createdAt

---

## 📊 Analytics Endpoints

### GET /analytics
Returns:
- Total processed
- Category counts
- Average confidence per category

### GET /analytics/histogram
Returns confidence distribution buckets:
- 0–3 (below threshold)
- 4–6 (weak)
- 7–10 (strong)
- 10+ (very strong)

Used for engine tuning.

---

## 🛠 Installation

```bash
git clone https://github.com/shaayar/snapwise
cd snapwise
npm install
node server/index.js
```

Open:

```bash
http://localhost:5000
```

---

## 🌐 Testing From Phone (Local Network)

1. Run server:

```bash
node server/index.js
```

2. Find your local IP:

```bash
ip addr
```

3. Open on phone:

```bash
http://YOUR_LOCAL_IP:5000
```

Alternatively use:

```bash
ngrok http 5000
```

---

## 🧪 Batch Upload

Supports up to 20 screenshots per request.

Frontend uses:

```text
upload.array("screenshots", 20)
```

---

## 🎯 Design Philosophy

Snapwise prioritizes:

* Deterministic classification
* Explainable scoring
* Minimal false positives
* Engine-first architecture

UI and automation layers will follow engine stability.

---

## 📌 Current Limitations

* English OCR only
* No metadata extraction yet
* No ML fallback
* No external OCR API
* No cloud storage
* No user authentication

---

## 🧭 Roadmap

### v0.3

* Confusion analytics
* Re-classification feedback loop
* UI refinement

### v0.4

* Hybrid ML fallback
* LLM benchmark evaluation

### v1.0

* Intent → Action automation
* Mobile wrapper
* Cloud deployment

---

## 🏗 Architecture Overview

```markdown
Upload
  ↓
Sharp Preprocess
  ↓
Tesseract OCR
  ↓
Noise Clean
  ↓
Rule Engine
  ↓
SQLite Persistence
  ↓
Analytics
```

---

## 🔍 Engine Hardening Focus

Current tuning priorities:

* Reduce false positives
* Improve structured movie detection
* Detect confusion pairs via scoreGap
* Balance threshold conservatism

---

## 👤 Author

Built by Shubham Dave
Project: Snapwise
