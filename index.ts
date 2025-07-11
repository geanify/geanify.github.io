import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
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

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = new Elysia();

// Serve static files from /public
app.use(staticPlugin({
  prefix: '/',
  assets: join(__dirname, 'public'),
  alwaysStatic: true,
}));

// Home page
app.get('/', async ({ request }) => {
  const url = new URL(request.url);
  return await homeRoute(request, url);
});

// Bor page
app.get('/bor', async ({ request }) => {
  const url = new URL(request.url);
  return await borRoute(request, url);
});

// Interlinked page
app.get('/interlinked', async ({ request }) => {
  const url = new URL(request.url);
  return await interlinkedRoute(request, url);
});

// Interlink API
app.post('/api/interlink', async ({ request }) => {
  const url = new URL(request.url);
  return await interlinkApiRoute(request, url);
});

// Stocks API
app.get('/api/stocks', async ({ request }) => {
  const url = new URL(request.url);
  return await stocksRoute(request, url);
});

// Serve /logo.png and /interlinked.png directly
app.get('/logo.png', () => Bun.file(join(__dirname, 'public', 'logo.png')));
app.get('/interlinked.png', () => Bun.file(join(__dirname, 'public', 'interlinked.png')));

app.listen({ port: 3000 });

console.log('Elysia server running on http://localhost:3000');