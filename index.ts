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
      // Render EJS template for root route
      if (url.pathname === "/") {
        const lang = url.searchParams.get("lang") === "ro" ? "ro" : "en";
        const t = await getTranslations(lang);
        const template = await readFile("views/index.ejs", "utf-8");
        const html = ejs.render(template, { t, lang }, { views: ["views"] });
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      }
      return new Response("Not Found", { status: 404 });
    },
  });
}