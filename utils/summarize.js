const { fetchData } = require("./helpers");

const splitSentences = (text) => {
  const sentences = [];
  let sentenceStr = "";
  let isQuote = false;

  for (const char of text) {
    sentenceStr += char;
    if (isQuote === false) {
      if (char === "“" || char === `"`) isQuote = true;
      else if (char === "." || char === "?" || char === "!") {
        sentences.push(sentenceStr);
        sentenceStr = "";
      }
    } else {
      if (char === "”" || char === `"`) isQuote = false;
    }
  }

  if (sentenceStr) {
    sentences.push(sentenceStr);
    sentenceStr = "";
  }

  for (let i = 0; i < sentences.length; i++) {
    sentences[i] = sentences[i].trim();
  }

  return sentences;
};

const createFreqTable = (tokens) => {
  const freqTable = {};

  for (const word of tokens) {
    if (word.info.stop) continue;
    freqTable[word.text] = (freqTable[word.text] || 0) + 1;
  }

  return freqTable;
};

const createSentenceScores = (sentences, freqTable) => {
  const sentenceScores = {};

  for (const sentence of sentences) {
    const wordCount = sentence.split(" ").length;
    const sentenceKey = sentence.slice(0, 10);

    for (const word in freqTable) {
      if (sentence.toLowerCase().includes(word)) {
        if (sentenceKey in sentenceScores) {
          sentenceScores[sentenceKey] += freqTable[word];
        } else {
          sentenceScores[sentenceKey] = freqTable[word];
        }
      }
    }

    sentenceScores[sentenceKey] = sentenceScores[sentenceKey] / wordCount;
  }

  return sentenceScores;
};

const findAverageScore = (scores) => {
  let sumValues = 0;

  for (const value of scores) {
    sumValues += value;
  }

  const average = sumValues / scores.length;

  return average;
};

const generateSummary = (sentences, sentenceScores, threshold) => {
  let summary = "";

  if (sentences.length === 1) return;

  for (const sentence of sentences) {
    const sentenceKey = sentence.slice(0, 10);
    if (
      sentenceKey in sentenceScores &&
      sentenceScores[sentenceKey] > threshold
    ) {
      summary += " " + sentence;
    }
  }

  return summary;
};

const summarize = async (rawText) => {
  const text = rawText.replace(/(\r\n|\n|\r)/gm, " ").trim();

  try {
    const results = await Promise.all([
      fetchData(
        "https://api.apilayer.com/nlp/tokenizer?lang=en",
        "POST",
        {
          apikey: process.env.API_LAYER_KEY,
        },
        text
      ),
      fetchData(
        "https://api.apilayer.com/keyword",
        "POST",
        {
          apikey: process.env.API_LAYER_KEY,
        },
        text
      ),
    ]);

    const [tokens, keywords] = results.map((res) => res.result);

    if (!tokens || !tokens.length || !keywords || !keywords.length) {
      throw new Error("Error fetching summary data");
    }

    const freqTable = createFreqTable(tokens);

    const sentences = splitSentences(text);

    const sentenceScores = createSentenceScores(sentences, freqTable);

    const threshold = findAverageScore(Object.values(sentenceScores));

    const summary = generateSummary(sentences, sentenceScores, threshold);

    const filteredKeywords = keywords.filter((keyword) => keyword.score > 0.6);

    if (!summary || (!filteredKeywords && !filteredKeywords.length)) {
      throw new Error("Unable to summarize");
    }

    return { summary, keywords: filteredKeywords };
  } catch (err) {
    throw err;
  }
};

module.exports = summarize;
