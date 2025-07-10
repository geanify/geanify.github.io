import { serve } from "bun";
// @ts-ignore
import ejs from "ejs";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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
          // Always resolve static file path relative to the script directory
          const __dirname = dirname(fileURLToPath(import.meta.url));
          const staticPath = join(__dirname, "public", url.pathname);
          console.log("[DEV STATIC] Trying to serve:", staticPath);
          const file = Bun.file(staticPath);
          if (await file.exists()) {
            // Bun will set the correct content-type automatically
            return new Response(file);
          } else {
            console.warn("[DEV STATIC] Not found:", staticPath);
          }
        } catch (e) {
          console.error("[DEV STATIC] Error serving static file:", e);
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
      // New Interlinked page route
      if (url.pathname === "/interlinked") {
        const lang = url.searchParams.get("lang") === "en" ? "en" : "ro";
        const t = await getTranslations(lang);
        const template = await readFile("views/interlinked/index.ejs", "utf-8");
        const html = ejs.render(template, { t, lang }, { views: ["views"] });
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      }
      // Placeholder endpoint for Interlinked form
      if (url.pathname === "/api/interlink" && req.method === "POST") {
        try {
          const body: any = await req.json();
          const inputA = body.inputA;
          const inputB = body.inputB;
          console.log("Received interlink:", { inputA, inputB });

          // Compose a placeholder prompt
          const prompt = `Interlink these two concepts: ${inputA} and ${inputB}.`;

          // Call OpenAI API
          const openaiKey = process.env.OPENAI_KEY;
          if (!openaiKey) {
            return new Response(JSON.stringify({ error: "Missing OPENAI_KEY env variable" }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }

          const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "system", content: "You are a helpful assistant that interlinks concepts." },
                { role: "user", content: prompt }
              ],
              max_tokens: 256
            })
          });

          if (!openaiRes.ok) {
            const err = await openaiRes.text();
            return new Response(JSON.stringify({ error: "OpenAI API error", details: err }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }

          const openaiData: any = await openaiRes.json();
          const choice: any = openaiData?.choices && openaiData.choices[0] ? openaiData.choices[0] : null;
          const completion = choice && choice.message && choice.message.content ? choice.message.content : "No response from OpenAI.";

          return new Response(JSON.stringify({ status: "ok", completion }), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: "Invalid JSON or OpenAI error", details: e?.message || e }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
      return new Response("Not Found", { status: 404 });
    },
  });
}