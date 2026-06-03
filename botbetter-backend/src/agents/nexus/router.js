const FITNESS_KEYWORDS = [
  "fitness", "workout", "exercise", "gym", "diet", "weight", "fat", "muscle",
  "protein", "calories", "bmi", "health", "yoga", "running", "cardio", "khana",
  "khaana", "vajan", "motapa", "slim", "body", "abs", "push up", "pushup",
  "wajan", "khel", "sport", "nutrition", "supplement", "whey", "creatine",
];

const INTERVIEW_KEYWORDS = [
  "interview", "job", "resume", "career", "placement", "internship", "hr",
  "dsa", "coding", "system design", "faang", "maang", "tcs", "infosys",
  "wipro", "accenture", "amazon", "google", "microsoft", "naukri", "linkedin",
  "salary", "offer", "naukri", "offer letter", "ctc", "package", "appraisal",
  "soft skills", "aptitude", "campus", "recruiter", "leetcode",
];

const EXAM_KEYWORDS = [
  "exam", "study", "neet", "jee", "upsc", "ssc", "banking", "gate", "ca",
  "clat", "cuet", "board", "12th", "10th", "revision", "syllabus", "mcq",
  "mock test", "notes", "chapter", "physics", "chemistry", "biology", "maths",
  "math", "padhai", "padhna", "padh", "science", "history", "polity", "geo",
];

const ECOMMERCE_KEYWORDS = [
  "meesho", "amazon", "flipkart", "ecommerce", "sell", "product", "listing",
  "seller", "shop", "store", "order", "customer", "business", "profit",
  "margin", "title", "description", "category", "price", "shipping", "cod",
  "return", "review", "rating", "reselling", "dropship",
];

const CONTENT_KEYWORDS = [
  "reel", "reels", "youtube", "instagram", "content", "creator", "viral",
  "video", "thumbnail", "caption", "hashtag", "followers", "subscribers",
  "views", "monetize", "brand deal", "collab", "niche", "script", "hook",
  "shorts", "tiktok", "posting", "schedule", "aesthetic", "trend", "trending",
];

const FINANCE_KEYWORDS = [
  "sip", "mutual fund", "investment", "invest", "stock", "share", "nifty",
  "sensex", "zerodha", "groww", "paytm money", "emi", "loan", "tax", "itr",
  "80c", "80d", "ppf", "nps", "fd", "rd", "insurance", "term plan", "budget",
  "saving", "money", "finance", "rupee", "paisa", "kharch", "income",
  "expense", "portfolio", "dividend", "return", "wealth",
];

function matchesKeyword(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(text);
}

function detectIntent(message) {
  const lower = message.toLowerCase();

  const scores = {
    flexai: FITNESS_KEYWORDS.filter((k) => matchesKeyword(lower, k)).length,
    prepify: INTERVIEW_KEYWORDS.filter((k) => matchesKeyword(lower, k)).length,
    cracky: EXAM_KEYWORDS.filter((k) => matchesKeyword(lower, k)).length,
    sellio: ECOMMERCE_KEYWORDS.filter((k) => matchesKeyword(lower, k)).length,
    creato: CONTENT_KEYWORDS.filter((k) => matchesKeyword(lower, k)).length,
    finio: FINANCE_KEYWORDS.filter((k) => matchesKeyword(lower, k)).length,
  };

  const maxScore = Math.max(...Object.values(scores));

  if (maxScore === 0) return "buddy";

  const winner = Object.entries(scores).find(([, score]) => score === maxScore);
  return winner ? winner[0] : "buddy";
}

module.exports = { detectIntent };
