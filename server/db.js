const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "../snapwise.db")
);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS screenshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      extractedText TEXT,
      category TEXT,
      confidence INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function saveResult(text, category, confidence) {
  db.run(
    `INSERT INTO screenshots (extractedText, category, confidence) VALUES (?, ?, ?)`,
    [text, category, confidence]
  );
}

function getAnalytics(callback) {
  db.all(
    `
    SELECT 
      category,
      COUNT(*) as count,
      AVG(confidence) as avgConfidence
    FROM screenshots
    GROUP BY category
    `,
    [],
    (err, rows) => {
      if (err) {
        console.error("Analytics query error:", err);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    }
  );
}

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

module.exports = { saveResult, getAnalytics, getConfidenceBuckets };
