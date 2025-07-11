// @ts-ignore
import ejs from "ejs";
import { readFile } from "fs/promises";
import { getTranslations } from "./getTranslations";

const htmlCache: Record<string, { html: string; timestamp: number }> = {};
const CACHE_TTL = 15 * 60 * 1000;

export async function homeRoute(req: Request, url: URL) {
  const lang = url.searchParams.get("lang") === "en" ? "en" : "ro";
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
    const t = await getTranslations(lang, 'home');
    const template = await readFile("views/home/index.ejs", "utf-8");
    const html = ejs.render(template, { t, lang }, { views: ["views"] });
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }
} 