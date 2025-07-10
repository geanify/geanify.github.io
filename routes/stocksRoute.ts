import { mkdir, writeFile } from "fs/promises";

export async function stocksRoute(req: Request, url: URL) {
  console.log("Proxy request for stocks:", url.searchParams.get("symbols"));
  const symbols = url.searchParams.get("symbols") || "AAPL,GOOGL,MSFT,AMZN,META,TSLA,NVDA";
  const cacheKey = symbols;
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const tempDir = "temp";
  const diskCacheFile = `${tempDir}/stock-${today}.json`;
  try {
    await mkdir(tempDir, { recursive: true });
  } catch {}
  const file = Bun.file(diskCacheFile);
  if (await file.exists()) {
    const diskData = await file.text();
    const diskCache = JSON.parse(diskData);
    console.log("Serving full stock data from disk cache");
    return new Response(JSON.stringify(diskCache), {
      headers: { "Content-Type": "application/json" }
    });
  }
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