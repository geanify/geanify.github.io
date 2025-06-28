import { serve } from "bun";
// @ts-ignore
import ejs from "ejs";
import { readFile } from "fs/promises";

async function getTranslations(lang: string) {
  try {
    const data = await readFile(`locales/${lang}.json`, "utf-8");
    return JSON.parse(data);
  } catch {
    const data = await readFile("locales/en.json", "utf-8");
    return JSON.parse(data);
  }
}

// In-memory cache for rendered HTML (prod only)
const htmlCache: Record<string, { html: string; timestamp: number }> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in ms

// In-memory cache for stock API responses
const stockCache: Record<string, { data: any; timestamp: number }> = {};
const STOCK_CACHE_TTL = 60 * 1000; // 1 minute

export function createWebHeraldServer({ port = 3000 } = {}) {
  return serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);
      // Serve static files from public directory
      if (url.pathname !== "/") {
        try {
          const file = Bun.file(`public${url.pathname}`);
          if (await file.exists()) {
            // Bun will set the correct content-type automatically
            return new Response(file);
          }
        } catch (e) {
          // Ignore and fall through to 404
        }
      }
      // Proxy endpoint for stock prices (to avoid CORS)
      if (url.pathname === "/api/stocks") {
        const symbols = url.searchParams.get("symbols") || "AAPL,GOOGL,MSFT,AMZN,META,TSLA,NVDA";
        const cacheKey = symbols;
        const now = Date.now();
        if (stockCache[cacheKey] && now - stockCache[cacheKey].timestamp < STOCK_CACHE_TTL) {
          return new Response(JSON.stringify(stockCache[cacheKey].data), {
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const apiKey = process.env.STOCK_API_KEY;
          if (!apiKey) {
            throw new Error("Missing Twelve Data API key in STOCK_API_KEY");
          }
          // Twelve Data supports batch quotes with comma-separated symbols
          const urlTwelve = `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${apiKey}`;
          const res = await fetch(urlTwelve);
          const data = await res.json();
          stockCache[cacheKey] = { data, timestamp: now };
          return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          console.error("Stock proxy error:", e);
          return new Response(JSON.stringify({ error: "Failed to fetch stock data" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
      // Render EJS template for root route
      if (url.pathname === "/") {
        const lang = url.searchParams.get("lang") === "ro" ? "ro" : "en";
        // Only use cache in production
        if (process.env.NODE_ENV === "production") {
          const cacheKey = lang;
          const cached = htmlCache[cacheKey];
          const now = Date.now();
          if (cached && now - cached.timestamp < CACHE_TTL) {
            return new Response(cached.html, {
              headers: { "Content-Type": "text/html" },
            });
          }
          const t = await getTranslations(lang);
          const template = await readFile("views/index.ejs", "utf-8");
          const html = ejs.render(template, { t, lang }, { views: ["views"] });
          htmlCache[cacheKey] = { html, timestamp: now };
          return new Response(html, {
            headers: { "Content-Type": "text/html" },
          });
        } else {
          // No cache in dev
          const t = await getTranslations(lang);
          const template = await readFile("views/index.ejs", "utf-8");
          const html = ejs.render(template, { t, lang }, { views: ["views"] });
          return new Response(html, {
            headers: { "Content-Type": "text/html" },
          });
        }
      }
      return new Response("Not Found", { status: 404 });
    },
  });
}