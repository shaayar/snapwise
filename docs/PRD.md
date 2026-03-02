# 📄 PRODUCT REQUIREMENTS DOCUMENT

## Product Name

Snapwise

## Version

0.1 (Web Validation Build)

## Status

In Development

---

## 1. Executive Summary

Snapwise is an intelligence engine that extracts actionable intent from screenshots and classifies them into structured categories.

This version focuses on validating classification robustness using rule-based and hybrid logic before UI investment.

---

## 2. Problem Statement

Users take screenshots of:

• Music posts
• Web-series details
• Threads announcements
• Articles
• Events
• Links

These screenshots remain unstructured in galleries and are rarely revisited.

Snapwise aims to convert screenshot text into categorized intent.

---

## 3. Validation Goal

Determine whether rule-based + hybrid classification can reliably categorize:

• Watch Later
• Listen Later
• Read Later
• Saved Links
• Events
• Unsorted

Accuracy target:
≥ 75% correct classification on test dataset.

---

## 4. Current Architecture

### Input

User uploads screenshot image.

### Processing Pipeline

1. Image Preprocessing (sharp)

   * Grayscale
   * Normalize
   * Sharpen

2. OCR Extraction (Tesseract)

3. Noise Cleaning

4. Rule-Based Scoring Engine

5. Classification Output

6. Persistence (SQLite)

---

## 5. Categories (v0.1)

• watch_later
• listen_later
• read_later
• saved_links
• events
• unsorted

---

## 6. Classification Strategy

### Rule-Based Engine

Weighted keyword scoring.

Minimum threshold required for category selection.

### Hybrid Plan (v0.2)

If rule confidence < threshold:
→ Send to ML fallback classifier.

---

## 7. Data Storage

SQLite Database:

Table: screenshots

Fields:
• id
• extractedText
• category
• confidence
• createdAt

Purpose:
Enable dataset analysis and heuristic refinement.

---

## 8. Non-Goals (v0.1)

• No metadata extraction
• No mobile integration
• No authentication
• No cloud sync
• No advanced UI
• No real-time screenshot monitoring

---

## 9. Success Metrics

• 75%+ classification accuracy
• < 5 second processing time
• Minimal misclassification on Instagram/Threads dataset

---

## 10. Future Roadmap

v0.2:
• ML fallback classifier
• Confidence normalization
• Basic UI dashboard

v0.3:
• Metadata extraction
• Batch upload
• Structured card interface

v1.0:
• Mobile wrapper
• Background ingestion
• Premium feature set

---
