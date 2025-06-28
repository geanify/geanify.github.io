import { serve } from "bun";
// @ts-ignore
import ejs from "ejs";
import { readFile } from "fs/promises";

serve({
  port: 3000,
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
      const template = await readFile("views/index.ejs", "utf-8");
      const html = ejs.render(template, { message: "Hello, world!" });
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
});