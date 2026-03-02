# 📄 SNAPWISE — TECHNICAL ARCHITECTURE DOCUMENT

Version: 0.1
Scope: Web Validation Build
Purpose: Debugging, system understanding, and future extensibility

---

# 1. High-Level System Overview

Snapwise v0.1 is a local web-based intelligence engine that processes uploaded screenshots and classifies them into structured intent categories.

System Type:
Monolithic Node.js application (local)

Core Stack:

* Node.js (Express)
* Tesseract.js (OCR)
* Sharp (Image preprocessing)
* SQLite (Persistence)
* Rule-based classification engine

---

# 2. End-to-End Data Flow

### Step 1 — User Upload

User selects screenshot on frontend.

Frontend sends:

POST /upload
FormData: screenshot (image file)

---

### Step 2 — Express Server Handling

File is handled by:
Multer middleware

File is saved to:

/uploads/{uniqueFileName}.png

Potential failure points:

* File too large
* Unsupported format
* Disk write failure

---

### Step 3 — Image Preprocessing (Sharp)

Function: preprocessImage(imagePath)

Operations:

* Convert to grayscale
* Normalize contrast
* Sharpen edges
* Save temporary processed file

Output:
processed_image_path

Failure points:

* Sharp not installed correctly
* Unsupported image format
* Memory issues for large images

---

### Step 4 — OCR (Tesseract.js)

Function: extractText(processedImage)

Tesseract.recognize(
image,
"eng"
)

Returns:
Raw extracted text string

Failure points:

* Language model loading failure
* Corrupted image
* Extremely noisy background
* Long processing time on large images

Performance expectation:
2–5 seconds per Instagram screenshot

---

### Step 5 — Noise Cleaning

Function: cleanNoise(text)

Operations:

* Remove non-word characters
* Collapse whitespace
* Normalize to lowercase

Purpose:
Reduce OCR noise before classification

Failure scenario:
Over-cleaning may remove meaningful symbols (URLs, punctuation)

---

### Step 6 — Rule-Based Classification

Function: classify(text)

Scoring functions:

* scoreWatchLater()
* scoreReadLater()
* scoreListenLater()
* scoreSavedLinks()
* scoreEvents()

Mechanism:
Each category assigns weighted score based on keyword matches.

Final Selection:
Highest score above threshold (≥ 4)

Output:

{
category: string,
confidence: number
}

Failure modes:

* Overlapping keywords causing misclassification
* Weak signal below threshold leading to unsorted
* False positives due to noisy OCR text

---

### Step 7 — Persistence

Function: saveResult(text, category, confidence)

Stored in SQLite:

Table: screenshots

Schema:

* id (INTEGER PRIMARY KEY)
* extractedText (TEXT)
* category (TEXT)
* confidence (INTEGER)
* createdAt (DATETIME)

Purpose:

* Dataset analysis
* Debugging misclassifications
* Engine tuning

Failure points:

* DB file permission issues
* Corrupted DB file
* Disk full

---

### Step 8 — API Response

Final response returned:

{
message: "Processed successfully",
category,
confidence,
extractedText
}

Frontend displays raw JSON.

---

# 3. API Endpoints

## POST /upload

Input:
multipart/form-data
Field: screenshot

Output:
JSON with classification + extractedText

---

## GET /health

Returns:
{
status: "Server running"
}

Purpose:
System check endpoint.

---

# 4. Confidence System

Confidence = sum of rule weights.

Not probabilistic.
Not ML confidence.

Threshold:
≥ 4 required for classification.

Future improvement:
Normalize scores to 0–1 range.

---

# 5. Hybrid ML Fallback (Planned)

Future flow:

If rule confidence < threshold:
→ Send cleaned text to ML classifier.

ML output:
Predicted category + probability.

Final result:
Compare rule score vs ML probability.

Hybrid decision logic:
Prefer rule when strong.
Fallback to ML when weak.

---

# 6. Debugging Guide

## If OCR returns garbage:

Check:

* Is preprocessing enabled?
* Is screenshot high contrast?
* Is image too large?
* Check console logs from Tesseract

Test:
Log extractedText length.

---

## If classification is wrong:

Check:

* Extracted text content
* Keyword presence
* Score breakdown

Add temporary logging:

console.log(scores);

To inspect rule scores per category.

---

## If everything returns "unsorted":

Likely:

* Threshold too high
* OCR cleaning too aggressive
* Keywords missing from rule set

---

## If server crashes:

Check:

* Sharp installation
* Node version
* SQLite file lock
* Memory usage

---

# 7. Performance Considerations

Processing Time:
OCR is bottleneck.

Optimization options:

* Resize large images before OCR
* Use Tesseract worker pooling
* Cache repeated uploads

---

# 8. System Limitations (v0.1)

* English-only OCR
* No multilingual support
* No ML semantic understanding
* No metadata extraction
* No batch upload

---

# 9. Observability Recommendations

Add in future:

* Request timing logs
* OCR duration logging
* Classification score logs
* Error logging file

---

# 10. Architectural Philosophy

Snapwise prioritizes:

Deterministic classification
Transparency
Incremental intelligence
Engine-first architecture

UI is secondary.

Core intelligence is primary asset.

---

# 🧠 Why This Document Matters

This is your:

• Debug map
• Architecture memory
• Developer onboarding guide
• Future refactor anchor

This prevents chaos.

---
