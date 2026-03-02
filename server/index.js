const { extractText } = require("./ocrServices");
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const { saveResult, getAnalytics } = require("./db");
const { classify } = require("../engine/intentEngine");

const app = express();
const PORT = 5000;

// -------------------
// Middleware
// -------------------
app.use(cors());
app.use(express.json());

// -------------------
// Ensure Upload Folder Exists
// -------------------
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// -------------------
// Multer Storage Config
// -------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// -------------------
// Static Frontend
// -------------------
app.use(express.static(path.join(__dirname, "..", "frontend")));

// -------------------
// Upload Endpoint
// -------------------
app.post("/upload", upload.array("screenshots", 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = [];

    for (const file of req.files) {
      const extractedText = await extractText(file.path);
      const classification = classify(extractedText);

      saveResult(
        extractedText,
        classification.category,
        classification.confidence
      );

      results.push({
        file: file.filename,
        category: classification.category,
        confidence: classification.confidence
      });
    }

    res.json({
      processed: results.length,
      results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Batch processing failed" });
  }
});

// -------------------
// Health Check
// -------------------
app.get("/health", (req, res) => {
  res.json({ status: "Server running" });
});

// -------------------
// Start Server
// -------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// -------------------
// Analytics Endpoint
// -------------------
app.get("/analytics", (req, res) => {
  getAnalytics((err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }

    res.json({
      totalProcessed: data.reduce((sum, row) => sum + row.count, 0),
      categories: data
    });
  });
});

app.get("/analytics/histogram", (req, res) => {
  getConfidenceBuckets((err, data) => {
    if (err) return res.status(500).json({ error: "Failed" });
    res.json(data);
  });
});