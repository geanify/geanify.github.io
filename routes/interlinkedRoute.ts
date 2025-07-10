// @ts-ignore
import ejs from "ejs";
import { readFile } from "fs/promises";
import { getTranslations } from "../index";

export async function interlinkedRoute(req: Request, url: URL) {
  const lang = url.searchParams.get("lang") === "en" ? "en" : "ro";
  const t = await getTranslations(lang);
  const template = await readFile("views/interlinked/index.ejs", "utf-8");
  const html = ejs.render(template, { t, lang }, { views: ["views"] });
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
} 