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
      userFeedback TEXT,
      correctedCategory TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add missing columns if they don't exist (for existing databases)
  db.run(`ALTER TABLE screenshots ADD COLUMN userFeedback TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('userFeedback column already exists or error:', err.message);
    }
  });

  db.run(`ALTER TABLE screenshots ADD COLUMN correctedCategory TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('correctedCategory column already exists or error:', err.message);
    }
  });
});

function saveResult(text, category, confidence) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO screenshots (extractedText, category, confidence) VALUES (?, ?, ?)`,
      [text, category, confidence],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
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

function saveFeedback(id, userFeedback, correctedCategory) {
  db.run(
    `UPDATE screenshots SET userFeedback = ?, correctedCategory = ? WHERE id = ?`,
    [userFeedback, correctedCategory, id]
  );
}

function getFeedback(callback) {
  db.all(
    `SELECT extractedText, category, correctedCategory, userFeedback 
     FROM screenshots 
     WHERE userFeedback IS NOT NULL 
     ORDER BY createdAt DESC`,
    [],
    callback
  );
}

function getUserList(callback) {
  db.all(
    `SELECT id, extractedText, 
            CASE 
              WHEN correctedCategory IS NOT NULL AND userFeedback = 'user_selected' THEN correctedCategory
              ELSE category 
            END as finalCategory,
            confidence,
            createdAt
     FROM screenshots 
     WHERE userFeedback = 'user_selected' OR userFeedback = 'correct'
     ORDER BY createdAt DESC`,
    [],
    callback
  );
}

function getUserCategories(callback) {
  db.all(
    `SELECT DISTINCT 
            CASE 
              WHEN correctedCategory IS NOT NULL AND userFeedback = 'user_selected' THEN correctedCategory
              ELSE category 
            END as finalCategory,
            COUNT(*) as count,
            AVG(confidence) as avgConfidence
     FROM screenshots 
     WHERE userFeedback = 'user_selected' OR userFeedback = 'correct'
     GROUP BY finalCategory
     ORDER BY avgConfidence DESC`,
    [],
    callback
  );
}

module.exports = { 
  saveResult, 
  getAnalytics, 
  getConfidenceBuckets,
  saveFeedback,
  getFeedback,
  getUserList,
  getUserCategories
};
