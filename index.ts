import { serve } from "bun";
// @ts-ignore
import ejs from "ejs";
import { readFile, writeFile, mkdir } from "fs/promises";

async function getTranslations(lang: string, page: string = 'home') {
  const fileName = `locales/${lang}.${page}.json`;
  try {
    const data = await readFile(fileName, "utf-8");
    return JSON.parse(data);
  } catch {
    const fallback = await readFile(`locales/ro.home.json`, "utf-8");
    return JSON.parse(fallback);
  }
}

// In-memory cache for rendered HTML (prod only)
const htmlCache: Record<string, { html: string; timestamp: number }> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in ms

export function createWebHeraldServer({ port = 3000, tls, hostname }: { port?: number; tls?: any; hostname?: string } = {}) {
  return serve({
    port,
    ...(hostname && { hostname }),
    ...(tls && { tls }),
    async fetch(req) {
      const url = new URL(req.url);
      
      // Debug logging for domain/IP issues
      console.log("Request URL:", req.url);
      console.log("Host header:", req.headers.get("host"));
      console.log("X-Forwarded-Host:", req.headers.get("x-forwarded-host"));
      console.log("X-Forwarded-Proto:", req.headers.get("x-forwarded-proto"));
      console.log("X-Real-IP:", req.headers.get("x-real-ip"));
      
      // In production with nginx, static files are served by nginx
      // Only serve static files in development mode
      if (process.env.NODE_ENV !== 'production' && url.pathname !== "/") {
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
        console.log("Proxy request for stocks:", url.searchParams.get("symbols"));
        const symbols = url.searchParams.get("symbols") || "AAPL,GOOGL,MSFT,AMZN,META,TSLA,NVDA";
        const cacheKey = symbols;
        const now = Date.now();
        // Disk cache: one file per day in 'temp' folder
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const tempDir = "temp";
        const diskCacheFile = `${tempDir}/stock-${today}.json`;
        try {
          // Ensure temp directory exists
          await mkdir(tempDir, { recursive: true });
        } catch {}
        // Check if disk cache file exists before reading/fetching
        const file = Bun.file(diskCacheFile);
        if (await file.exists()) {
          const diskData = await file.text();
          const diskCache = JSON.parse(diskData);
          console.log("Serving full stock data from disk cache");
          return new Response(JSON.stringify(diskCache), {
            headers: { "Content-Type": "application/json" }
          });
        }
        // If not in disk cache, fetch from API
        try {
          const apiKey = process.env.STOCK_API_KEY;
          if (!apiKey) {
            throw new Error("Missing Twelve Data API key in STOCK_API_KEY");
          }
          const urlTwelve = `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${apiKey}`;
          const res = await fetch(urlTwelve);
          const data = await res.json();
          console.log("Twelve Data response:", data);
          await writeFile(diskCacheFile, JSON.stringify(data), "utf-8");
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
        const lang = url.searchParams.get("lang") === "en" ? "en" : "ro";
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
          const t = await getTranslations(lang, 'home');
          const template = await readFile("views/home/index.ejs", "utf-8");
          const html = ejs.render(template, { t, lang }, { views: ["views"] });
          htmlCache[cacheKey] = { html, timestamp: now };
          return new Response(html, {
            headers: { "Content-Type": "text/html" },
          });
        } else {
          // No cache in dev
          const t = await getTranslations(lang, 'home');
          const template = await readFile("views/home/index.ejs", "utf-8");
          const html = ejs.render(template, { t, lang }, { views: ["views"] });
          return new Response(html, {
            headers: { "Content-Type": "text/html" },
          });
        }
      }
      // New BOR page route
      if (url.pathname === "/bor") {
        const lang = url.searchParams.get("lang") === "en" ? "en" : "ro";
        const t = await getTranslations(lang);
        const template = await readFile("views/bor/index.ejs", "utf-8");
        const html = ejs.render(template, { t, lang }, { views: ["views"] });
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      }
      return new Response("Not Found", { status: 404 });
    },
  });
}