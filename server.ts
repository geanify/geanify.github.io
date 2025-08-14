import index from "./index.html";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
    "/health": {
      GET: () => {
        return new Response(JSON.stringify({ status: "healthy", timestamp: new Date().toISOString() }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }
  },
  development: {
    hmr: true,
    console: true,
  },
  error(error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

console.log(`🚀 Server running at http://localhost:${server.port}`);
console.log("📁 Serving static HTML with hot reload enabled");
console.log("🔗 Health check available at http://localhost:3000/health"); 