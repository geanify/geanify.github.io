import { readFile, } from "fs/promises";

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
  