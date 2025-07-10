import { serve } from "bun";
// @ts-ignore
import ejs from "ejs";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homeRoute } from "./routes/homeRoute";
import { borRoute } from "./routes/borRoute";
import { interlinkedRoute } from "./routes/interlinkedRoute";
import { stocksRoute } from "./routes/stocksRoute";
import { interlinkApiRoute } from "./routes/interlinkApiRoute";

export async function getTranslations(lang: string, page: string = 'home') {
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
        return await stocksRoute(req, url);
      }
      // Render EJS template for root route
      if (url.pathname === "/") {
        return await homeRoute(req, url);
      }
      // New BOR page route
      if (url.pathname === "/bor") {
        return await borRoute(req, url);
      }
      // New Interlinked page route
      if (url.pathname === "/interlinked") {
        return await interlinkedRoute(req, url);
      }
      // Endpoint for Interlinked form
      if (url.pathname === "/api/interlink" && req.method === "POST") {
        return await interlinkApiRoute(req, url);
      }
      return new Response("Not Found", { status: 404 });
    },
  });
}