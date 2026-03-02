function normalize(text) {
  return text.toLowerCase();
}

function scoreWatchLater(text) {
  const keywords = [
    "episode",
    "season",
    "imdb",
    "rating",
    "prime video",
    "netflix",
    "web-series",
    "genre",
    "released",
    "to watch"
  ];

  let score = 0;
  keywords.forEach(word => {
    if (text.includes(word)) score += 2;
  });

  return score;
}

function scoreReadLater(text) {
  const lengthScore = text.length > 300 ? 3 : 0;
  const paragraphScore = text.split("\n").length > 5 ? 2 : 0;
  return lengthScore + paragraphScore;
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

  let score = 0;
  keywords.forEach(word => {
    if (text.includes(word)) score += 2;
  });

  return score;
}

function scoreEvents(text) {
  const dateRegex = /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/g;
  const timeRegex = /\d{1,2}:\d{2}/g;

  let score = 0;
  if (dateRegex.test(text)) score += 4;
  if (timeRegex.test(text)) score += 2;

  return score;
}

function classify(text) {

  function cleanNoise(text) {
    return text
      .replace(/[^\w\s:\/\.\-&]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const cleanText = cleanNoise(normalize(text));

  const scores = {
    watch_later: scoreWatchLater(cleanText),
    read_later: scoreReadLater(cleanText),
    saved_links: scoreLinks(cleanText),
    listen_later: scoreListenLater(cleanText),
    events: scoreEvents(cleanText)
  };

  // Convert to sorted array (highest score first)
  const sortedScores = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);

  const [topCategory, topScore] = sortedScores[0];
  const [secondCategory, secondScore] = sortedScores[1] || ["none", 0];

  const finalCategory = topScore >= 4 ? topCategory : "unsorted";

  return {
    category: finalCategory,
    confidence: topScore,
    scoreBreakdown: scores,
    secondBest: {
      category: secondCategory,
      score: secondScore
    },
    scoreGap: topScore - secondScore
  };
}

module.exports = { classify };