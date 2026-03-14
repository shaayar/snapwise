const { extractText } = require("./ocrServices");
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const { saveResult, getAnalytics, saveFeedback, getUserList, getUserCategories } = require("./db");
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
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp, bmp, tiff)"));
  }
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

    // Process all files in parallel for better performance
    const processPromises = req.files.map(async (file) => {
      const { text: extractedText, confidence: ocrConfidence } = await extractText(file.path);
      const classification = classify(extractedText);

      const resultId = await saveResult(
        extractedText,
        classification.category,
        classification.confidence
      );

      return {
        id: resultId,
        file: file.filename,
        category: classification.category,
        confidence: classification.confidence,
        extractedText: extractedText,
        ocrConfidence: ocrConfidence,
        scoreBreakdown: classification.scoreBreakdown,
        topCategories: classification.topCategories
      };
    });

    const results = await Promise.all(processPromises);

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
// Debug OCR Endpoint
// -------------------
app.post("/debug-ocr", upload.single("screenshot"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { text: extractedText, confidence: ocrConfidence } = await extractText(req.file.path);
    const classification = classify(extractedText);

    res.json({
      filename: req.file.filename,
      extractedText: extractedText,
      ocrConfidence: ocrConfidence,
      classification: classification
    });

  } catch (error) {
    console.error("Debug OCR Error:", error);
    res.status(500).json({ error: "OCR processing failed" });
  }
});

// -------------------
// Feedback Endpoint
// -------------------
app.post("/feedback", (req, res) => {
  const { id, userFeedback, correctedCategory } = req.body;
  
  if (!id || !userFeedback || !correctedCategory) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  saveFeedback(id, userFeedback, correctedCategory);
  res.json({ message: "Feedback saved successfully" });
});

// -------------------
// User List Endpoint
// -------------------
app.get("/my-list", (req, res) => {
  getUserList((err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch user list" });
    }

    // Group by category
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.finalCategory]) {
        acc[item.finalCategory] = [];
      }
      acc[item.finalCategory].push({
        id: item.id,
        text: item.extractedText.substring(0, 200) + (item.extractedText.length > 200 ? "..." : ""),
        fullText: item.extractedText,
        confidence: item.confidence,
        createdAt: item.createdAt
      });
      return acc;
    }, {});

    res.json({
      total: data.length,
      categories: grouped
    });
  });
});

// -------------------
// User Categories Management Endpoint
// -------------------
app.get("/my-categories", (req, res) => {
  getUserCategories((err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch user categories" });
    }

    res.json({
      total: data.length,
      categories: data
    });
  });
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