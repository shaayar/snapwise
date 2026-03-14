function normalize(text) {
  return text.toLowerCase();
}

/*
  Safe OCR corrections:
  - Only word-level corrections
  - No single character global replacements
*/
function correctOCRErrors(text) {
  const corrections = {
    "basterds": "bastards",
    "helio": "hello"
  };

  let corrected = text;

  Object.entries(corrections).forEach(([wrong, right]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, "g");
    corrected = corrected.replace(regex, right);
  });

  return corrected;
}

/*
  Controlled fuzzy matching:
  - Direct match first
  - Only compare words of similar length
  - Limit Levenshtein comparisons
*/
function fuzzyMatch(text, keywords, threshold = 0.8) {
  let matches = 0;
  const words = text.split(/\s+/);

  keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      matches++;
    } else {
      for (const word of words) {
        if (Math.abs(word.length - keyword.length) > 2) continue;

        const distance = levenshteinDistance(word, keyword);
        const similarity =
          1 - distance / Math.max(word.length, keyword.length);

        if (similarity >= threshold) {
          matches++;
          break;
        }
      }
    }
  });

  return matches;
}

function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/* ---------------- SCORING ---------------- */

function scoreWatchLater(text) {
  let score = 0;

  // Strong explicit streaming signals
  const strongKeywords = [
    "episode",
    "season",
    "imdb",
    "rating",
    "prime video",
    "netflix",
    "web-series",
    "released",
    "to watch"
  ];

  score += fuzzyMatch(text, strongKeywords) * 2;

  // Structured pattern: Movie: Title (2009)
  const moviePattern = /movie\s*:\s*[a-z0-9\s]+?\(\d{4}\)/i;
  if (moviePattern.test(text)) score += 4;

  // Year pattern support
  const yearPattern = /\(\d{4}\)/;
  if (yearPattern.test(text)) score += 1;

  // Soft cinematic context
  const softKeywords = [
    "movie",
    "film",
    "cinema",
    "directed",
    "starring",
    "cast",
    "runtime"
  ];

  const softMatches = fuzzyMatch(text, softKeywords);

  if (softMatches >= 2) score += 2;

  return score;
}

function scoreReadLater(text) {
  let score = 0;

  const readKeywords = [
    "article",
    "blog",
    "medium",
    "substack",
    "post",
    "story",
    "news",
    "tutorial",
    "guide",
    "documentation",
    "wiki",
    "reddit"
  ];

  const platformKeywords = [
    "medium.com",
    "substack.com",
    "dev.to",
    "reddit.com",
    "news.ycombinator.com"
  ];

  const hasLongParagraphs = text.split("\n").length > 3;
  const hasReadSignal = fuzzyMatch(text, readKeywords) > 0;
  const hasPlatformSignal = fuzzyMatch(text, platformKeywords) > 0;

  if (hasReadSignal) score += 3;
  if (hasPlatformSignal) score += 4;
  if (hasLongParagraphs && (hasReadSignal || hasPlatformSignal))
    score += 2;

  return score;
}

function scoreLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const domainRegex = /\.(com|dev|io|org|net)/g;

  let score = 0;
  if (urlRegex.test(text)) score += 5;
  if (domainRegex.test(text)) score += 3;

  return score;
}

function scoreListenLater(text) {
  const keywords = [
    "song",
    "album",
    "single",
    "spotify",
    "track",
    "band"
  ];

  return fuzzyMatch(text, keywords) * 2;
}

function scoreEvents(text) {
  const dateRegex =
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/g;

  const timeRegex = /\d{1,2}:\d{2}/g;

  let score = 0;
  if (dateRegex.test(text)) score += 4;
  if (timeRegex.test(text)) score += 2;

  return score;
}

/* ---------------- CLASSIFIER ---------------- */

function classify(text) {
  function cleanNoise(text) {
    return text
      .replace(/[^\w\s:\/\.\-&]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const normalized = normalize(text);
  const corrected = correctOCRErrors(normalized);
  const cleanText = cleanNoise(corrected);

  const scores = {
    watch_later: scoreWatchLater(cleanText),
    read_later: scoreReadLater(cleanText),
    saved_links: scoreLinks(cleanText),
    listen_later: scoreListenLater(cleanText),
    events: scoreEvents(cleanText)
  };

  const sortedScores = Object.entries(scores).sort(
    (a, b) => b[1] - a[1]
  );

  const [topCategory, topScore] = sortedScores[0];
  const [secondCategory, secondScore] =
    sortedScores[1] || ["none", 0];

  const finalCategory = topScore >= 4 ? topCategory : "unsorted";

  // Get top 3 categories
  const topCategories = sortedScores.slice(0, 3).map(([category, score]) => ({
    category,
    score,
    confidence: score,
    isCustom: category === "unsorted" && score === 0
  }));

  return {
    category: finalCategory,
    confidence: topScore,
    scoreBreakdown: scores,
    topCategories: topCategories,
    secondBest: {
      category: secondCategory,
      score: secondScore
    },
    scoreGap: topScore - secondScore
  };
}

module.exports = { classify };