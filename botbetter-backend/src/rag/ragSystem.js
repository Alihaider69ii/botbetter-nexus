const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
const Parser = require("rss-parser");
const { tavily } = require("@tavily/core");
const { upsertDocuments, searchAll, cleanupOldData, getStatus } = require("./vectorStore");

const rssParser = new Parser({ timeout: 15000 });
let cronStarted = false;

function iso(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function doc({ title, content, url, source, category, publishedAt }) {
  return {
    title: String(title || "").trim(),
    content: String(content || "").replace(/\s+/g, " ").trim(),
    url,
    source,
    category,
    publishedAt: iso(publishedAt),
  };
}

async function safeFetch(label, fn) {
  try {
    return await fn();
  } catch (e) {
    console.warn(`[RAG] ${label} failed:`, e.message);
    return [];
  }
}

async function fetchRss(url, source, category) {
  const feed = await rssParser.parseURL(url);
  return (feed.items || []).slice(0, 30).map((item) => doc({
    title: item.title,
    content: item.contentSnippet || item.content || item.summary || item.title,
    url: item.link,
    source,
    category,
    publishedAt: item.isoDate || item.pubDate,
  }));
}

async function fetchTavilyNews() {
  if (!process.env.TAVILY_API_KEY) return [];
  const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
  const result = await client.search("latest world news politics economy India technology AI", {
    topic: "news",
    maxResults: 20,
  });

  return (result.results || []).map((item) => doc({
    title: item.title,
    content: item.content,
    url: item.url,
    source: "Tavily",
    category: "global_news",
    publishedAt: item.publishedDate,
  }));
}

async function fetchNewsApi(query, category) {
  if (!process.env.NEWSAPI_KEY) return [];
  const response = await axios.get("https://newsapi.org/v2/everything", {
    params: {
      q: query,
      language: "en",
      sortBy: "publishedAt",
      pageSize: 30,
      apiKey: process.env.NEWSAPI_KEY,
    },
    timeout: 15000,
  });

  return (response.data.articles || []).map((item) => doc({
    title: item.title,
    content: item.description || item.content,
    url: item.url,
    source: item.source?.name || "NewsAPI",
    category,
    publishedAt: item.publishedAt,
  }));
}

async function fetchHackerNews() {
  const top = await axios.get("https://hacker-news.firebaseio.com/v0/topstories.json", { timeout: 15000 });
  const ids = (top.data || []).slice(0, 30);
  const stories = await Promise.all(ids.map((id) =>
    axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 15000 }).then((r) => r.data)
  ));

  return stories.filter(Boolean).map((item) => doc({
    title: item.title,
    content: item.text || item.title,
    url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    source: "Hacker News",
    category: "tech",
    publishedAt: item.time ? new Date(item.time * 1000).toISOString() : undefined,
  }));
}

async function refreshNews() {
  const [tavilyNews, globalNewsApi, indiaNewsApi, bbc, reuters, techCrunch, ndtv, toi, hackerNews] = await Promise.all([
    safeFetch("Tavily news", fetchTavilyNews),
    safeFetch("NewsAPI global", () => fetchNewsApi("world OR politics OR economy", "global_news")),
    safeFetch("NewsAPI India", () => fetchNewsApi("India OR Delhi OR Mumbai OR Bengaluru", "india_news")),
    safeFetch("BBC RSS", () => fetchRss("https://feeds.bbci.co.uk/news/world/rss.xml", "BBC", "global_news")),
    safeFetch("Reuters RSS", () => fetchRss("https://feeds.reuters.com/reuters/topNews", "Reuters", "global_news")),
    safeFetch("TechCrunch RSS", () => fetchRss("https://techcrunch.com/feed/", "TechCrunch", "tech")),
    safeFetch("NDTV RSS", () => fetchRss("https://feeds.feedburner.com/ndtvnews-india-news", "NDTV", "india_news")),
    safeFetch("Times of India RSS", () => fetchRss("https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", "Times of India", "india_news")),
    safeFetch("Hacker News", fetchHackerNews),
  ]);

  const globalDocs = [...tavilyNews, ...globalNewsApi, ...bbc, ...reuters];
  const indiaDocs = [...indiaNewsApi, ...ndtv, ...toi];
  const techDocs = [...techCrunch, ...hackerNews, ...tavilyNews.filter((item) => /tech|ai|software/i.test(item.content))];

  await upsertDocuments("news_global", globalDocs);
  await upsertDocuments("news_india", indiaDocs);
  await upsertDocuments("tech", techDocs);
  return { news_global: globalDocs.length, news_india: indiaDocs.length, tech: techDocs.length };
}

async function fetchCricket() {
  if (!process.env.CRICAPI_KEY) return [];
  const response = await axios.get("https://api.cricapi.com/v1/currentMatches", {
    params: { apikey: process.env.CRICAPI_KEY, offset: 0 },
    timeout: 15000,
  });

  return (response.data.data || []).slice(0, 50).map((match) => doc({
    title: match.name,
    content: `${match.status || ""} ${match.venue || ""} ${JSON.stringify(match.score || [])}`,
    url: "https://www.cricapi.com/",
    source: "CricAPI",
    category: "cricket",
    publishedAt: match.dateTimeGMT,
  }));
}

async function fetchEspnScoreboard(sport, league, source) {
  const response = await axios.get(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`, { timeout: 15000 });
  return (response.data.events || []).map((event) => doc({
    title: event.name || event.shortName,
    content: event.competitions?.[0]?.status?.type?.description || event.name,
    url: event.links?.[0]?.href,
    source,
    category: "sports",
    publishedAt: event.date,
  }));
}

async function fetchFormula1() {
  const response = await axios.get("https://api.jolpi.ca/ergast/f1/current/last/results.json", { timeout: 15000 });
  const races = response.data?.MRData?.RaceTable?.Races || [];
  return races.flatMap((race) => (race.Results || []).slice(0, 10).map((result) => doc({
    title: `${race.raceName}: ${result.Driver.givenName} ${result.Driver.familyName}`,
    content: `Position ${result.position}, ${result.Constructor.name}, ${result.status}`,
    url: race.url,
    source: "Jolpica F1",
    category: "formula_1",
    publishedAt: `${race.date}T${race.time || "00:00:00Z"}`,
  })));
}

async function refreshSports() {
  const [cricket, football, nba, formula1, tennis] = await Promise.all([
    safeFetch("Cricket", fetchCricket),
    safeFetch("Football", () => fetchEspnScoreboard("soccer", "eng.1", "ESPN Premier League")),
    safeFetch("NBA", () => fetchEspnScoreboard("basketball", "nba", "ESPN NBA")),
    safeFetch("Formula 1", fetchFormula1),
    safeFetch("ATP tennis RSS", () => fetchRss("https://www.atptour.com/en/news/rss-feed", "ATP", "tennis")),
  ]);

  const docs = [...cricket, ...football, ...nba, ...formula1, ...tennis];
  await upsertDocuments("sports", docs);
  return { sports: docs.length };
}

async function fetchCrypto() {
  const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
    params: {
      ids: "bitcoin,ethereum,solana,ripple,dogecoin,cardano",
      vs_currencies: "usd,inr",
      include_24hr_change: true,
      x_cg_demo_api_key: process.env.COINGECKO_API_KEY,
    },
    timeout: 15000,
  });

  return Object.entries(response.data || {}).map(([asset, value]) => doc({
    title: `${asset} price`,
    content: `USD ${value.usd}, INR ${value.inr}, 24h change ${value.usd_24h_change}`,
    url: `https://www.coingecko.com/en/coins/${asset}`,
    source: "CoinGecko",
    category: "crypto",
  }));
}

async function fetchMarketRates() {
  const response = await axios.get("https://query1.finance.yahoo.com/v7/finance/quote", {
    params: { symbols: "^GSPC,^DJI,^IXIC,^FTSE,^N225,^NSEI,^BSESN,USDINR=X,EURUSD=X,GBPUSD=X" },
    timeout: 15000,
  });

  return (response.data.quoteResponse?.result || []).map((item) => doc({
    title: item.shortName || item.symbol,
    content: `${item.symbol}: ${item.regularMarketPrice}, change ${item.regularMarketChangePercent}%`,
    url: `https://finance.yahoo.com/quote/${encodeURIComponent(item.symbol)}`,
    source: "Yahoo Finance",
    category: /INR|USD|EUR|GBP/.test(item.symbol) ? "currency" : "stocks",
  }));
}

async function refreshFinance() {
  const [crypto, markets] = await Promise.all([
    safeFetch("CoinGecko", fetchCrypto),
    safeFetch("Market rates", fetchMarketRates),
  ]);

  const docs = [...crypto, ...markets];
  await upsertDocuments("finance", docs);
  return { finance: docs.length };
}

async function fetchGithubTrending() {
  const response = await axios.get("https://github.com/trending?since=daily", { timeout: 15000 });
  const $ = cheerio.load(response.data);
  const repos = [];

  $("article.Box-row").slice(0, 25).each((_, el) => {
    const name = $(el).find("h2 a").text().replace(/\s+/g, " ").trim();
    const description = $(el).find("p").text().replace(/\s+/g, " ").trim();
    const href = $(el).find("h2 a").attr("href");
    repos.push(doc({
      title: name,
      content: description || name,
      url: href ? `https://github.com${href}` : "https://github.com/trending",
      source: "GitHub Trending",
      category: "tech",
    }));
  });

  return repos;
}

async function refreshEntertainmentAndTech() {
  const [movies, music, github, productHunt, youtube] = await Promise.all([
    safeFetch("Movie RSS", () => fetchRss("https://movieweb.com/feed/movie-news/", "MovieWeb", "movies")),
    safeFetch("Last.fm", async () => {
      if (!process.env.LASTFM_API_KEY) return [];
      const response = await axios.get("https://ws.audioscrobbler.com/2.0/", {
        params: { method: "chart.gettoptracks", api_key: process.env.LASTFM_API_KEY, format: "json", limit: 30 },
        timeout: 15000,
      });
      return (response.data.tracks?.track || []).map((track) => doc({
        title: `${track.name} - ${track.artist?.name}`,
        content: `Trending music track by ${track.artist?.name}`,
        url: track.url,
        source: "Last.fm",
        category: "music",
      }));
    }),
    safeFetch("GitHub trending", fetchGithubTrending),
    safeFetch("Product Hunt RSS", () => fetchRss("https://www.producthunt.com/feed", "Product Hunt", "tech")),
    safeFetch("YouTube trending", async () => {
      if (!process.env.YOUTUBE_API_KEY) return [];
      const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        params: { part: "snippet,statistics", chart: "mostPopular", regionCode: "IN", maxResults: 25, key: process.env.YOUTUBE_API_KEY },
        timeout: 15000,
      });
      return (response.data.items || []).map((item) => doc({
        title: item.snippet?.title,
        content: item.snippet?.description,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        source: "YouTube Trending India",
        category: "youtube",
        publishedAt: item.snippet?.publishedAt,
      }));
    }),
  ]);

  await upsertDocuments("entertainment", [...movies, ...music, ...youtube]);
  await upsertDocuments("tech", [...github, ...productHunt]);
  return { entertainment: movies.length + music.length + youtube.length, tech: github.length + productHunt.length };
}

async function refreshWeather() {
  if (!process.env.OPENWEATHER_API_KEY) return { weather: 0 };
  const cities = ["Delhi", "Mumbai", "Bengaluru", "London", "New York", "Dubai", "Singapore", "Tokyo"];
  const responses = await Promise.all(cities.map((city) => safeFetch(`Weather ${city}`, async () => {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: { q: city, appid: process.env.OPENWEATHER_API_KEY, units: "metric" },
      timeout: 15000,
    });
    const data = response.data;
    return [doc({
      title: `${data.name} weather`,
      content: `${data.weather?.[0]?.description}, ${data.main?.temp} C, humidity ${data.main?.humidity}%, wind ${data.wind?.speed} m/s`,
      url: "https://openweathermap.org/",
      source: "OpenWeather",
      category: "weather",
    })];
  })));

  const docs = responses.flat();
  await upsertDocuments("weather", docs);
  return { weather: docs.length };
}

async function refreshAll() {
  const [news, sports, finance, entertainmentTech, weather] = await Promise.all([
    refreshNews(),
    refreshSports(),
    refreshFinance(),
    refreshEntertainmentAndTech(),
    refreshWeather(),
  ]);
  await cleanupOldData();
  return { ...news, ...sports, ...finance, ...entertainmentTech, ...weather };
}

function startRagCron() {
  if (cronStarted) return;
  cronStarted = true;

  cron.schedule("0 */6 * * *", refreshNews, { timezone: "Asia/Kolkata" });
  cron.schedule("0 * * * *", refreshSports, { timezone: "Asia/Kolkata" });
  cron.schedule("*/30 * * * *", refreshFinance, { timezone: "Asia/Kolkata" });
  cron.schedule("0 */3 * * *", refreshWeather, { timezone: "Asia/Kolkata" });
  cron.schedule("30 */6 * * *", refreshEntertainmentAndTech, { timezone: "Asia/Kolkata" });
  cron.schedule("15 0 * * *", cleanupOldData, { timezone: "Asia/Kolkata" });

  refreshAll().catch((e) => console.warn("[RAG] Initial refresh failed:", e.message));
}

async function getRagContext(query, limit = 6) {
  const results = await searchAll(query, limit);
  if (results.length === 0) return "No live context available.";

  return results.map((item) => {
    const date = item.publishedAt ? item.publishedAt.slice(0, 10) : "recent";
    return `${item.collection}: ${item.title} (${item.source}, ${date}) - ${String(item.content).slice(0, 280)}`;
  }).join("\n");
}

module.exports = {
  refreshAll,
  refreshNews,
  refreshSports,
  refreshFinance,
  refreshWeather,
  refreshEntertainmentAndTech,
  startRagCron,
  getRagContext,
  searchAll,
  getStatus,
};
